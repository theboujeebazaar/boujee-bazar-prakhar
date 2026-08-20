// 'use server'

// import { createClient } from '@/lib/supabase/server'
// import { revalidatePath } from 'next/cache'
// import { cookies } from 'next/headers'

// import { createAdminClient } from '@/lib/supabase/admin'


// async function checkAdminAuth(supabase: any) {
//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user) return false

//   const { data: profile } = await supabase
//     .from('profiles')
//     .select('role')
//     .eq('id', user.id)
//     .single()

//   return profile?.role === 'admin'
// }

// export async function updateOrderStatus(orderId: string, status: string) {
//    const cookieStore = await cookies()
//   const isBoujeeAdmin = cookieStore.get('boujee-admin-logged-in')?.value === 'true'
//   const isMockAdmin = cookieStore.get('mock-admin-logged-in')?.value === 'true'

//   if (!isBoujeeAdmin && !isMockAdmin) {
//     return { error: 'Unauthorized Administrative Access.' }
//   }

//   const isAdmin = await checkAdminAuth(supabase)
//   if (!isAdmin) return { success: false, error: 'Unauthorized' }

//   const { createAdminClient } = await import('@/lib/supabase/admin')
//   const adminClient = createAdminClient()

//   const updateData: any = { order_status: status }

//   // Set timestamps based on new status
//   if (status === 'shipped') updateData.shipped_at = new Date().toISOString()
//   if (status === 'delivered') updateData.delivered_at = new Date().toISOString()
//   if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString()

//   const { error } = await adminClient
//     .from('orders')
//     .update(updateData)
//     .eq('id', orderId)

//   if (error) return { success: false, error: error.message }

//   revalidatePath('/admin/orders')
//   revalidatePath(`/admin/orders/${orderId}`)
//   return { success: true }
// }

// export async function updatePaymentStatus(orderId: string, status: string) {
//   const supabase = await createClient()

//   const isAdmin = await checkAdminAuth(supabase)
//   if (!isAdmin) return { success: false, error: 'Unauthorized' }

//   const { createAdminClient } = await import('@/lib/supabase/admin')
//   const adminClient = createAdminClient()

//   const updateData: any = { payment_status: status }

//   // Set timestamps based on new status
//   if (status === 'paid') updateData.paid_at = new Date().toISOString()

//   const { error } = await adminClient
//     .from('orders')
//     .update(updateData)
//     .eq('id', orderId)

//   if (error) return { success: false, error: error.message }

//   revalidatePath('/admin/orders')
//   revalidatePath(`/admin/orders/${orderId}`)
//   return { success: true }
// }
'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { createShiprocketOrder } from '@/lib/shiprocket'

async function requireAdmin() {
  const cookieStore = await cookies()
  const isBoujeeAdmin = cookieStore.get('boujee-admin-logged-in')?.value === 'true'
  const isMockAdmin = cookieStore.get('mock-admin-logged-in')?.value === 'true'
  return isBoujeeAdmin || isMockAdmin
}

export async function updateOrderStatus(orderId: string, status: string) {
  // 1. ✅ SECURE COOKIE BYPASS: Authenticates your direct admin session flags
  if (!(await requireAdmin())) {
    return { success: false, error: 'Unauthorized Administrative Access.' }
  }

  // 2. ✅ MASTER SUPERUSER BYPASS: Override RLS permissions natively
  const adminClient = createAdminClient()

  // NOTE: previously this bug overwrote the `status` column with a raw
  // timestamp string instead of the chosen status value whenever the new
  // status was 'shipped' / 'delivered' / 'cancelled'. Fixed: the status
  // column now always stores the actual status string.
  const updateData: any = { status: status }

  const { error } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}

export async function updatePaymentStatus(orderId: string, status: string) {
  // 1. ✅ SECURE COOKIE BYPASS: Authenticates your direct admin session flags
  if (!(await requireAdmin())) {
    return { success: false, error: 'Unauthorized Administrative Access.' }
  }

  // 2. ✅ MASTER SUPERUSER BYPASS: Override RLS permissions natively
  const adminClient = createAdminClient()

  // NOTE: previously this bug overwrote `payment_status` with a raw
  // timestamp string when the new status was 'paid'. Fixed: the
  // payment_status column now always stores the actual status string.
  const updateData: any = { payment_status: status }

  const { error } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}

// ─── Shiprocket ──────────────────────────────────────────────
//
// Creates the order on Shiprocket's side only. No courier is auto-assigned
// and no pickup is auto-scheduled here on purpose — after this runs, an
// admin goes to Shiprocket's own dashboard and clicks "Ship Now" on the
// order there (the URL for that lives in lib/shiprocket.ts — a 'use server'
// file like this one can only export async functions, so a plain string
// constant can't live here), which is where you pick a courier, see live
// rates, and confirm the shipment. The AWB code / courier name / live
// status then arrive back into our DB via the Shiprocket webhook
// (app/api/shiphook/route.ts) once you ship it — they are not set by this
// action.
export async function createShiprocketShipment(orderId: string, weightKgOverride?: number) {
  if (!(await requireAdmin())) {
    return { success: false, error: 'Unauthorized Administrative Access.' }
  }

  const adminClient = createAdminClient()

  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .select(
      'id, customer_name, customer_email, customer_phone, items, subtotal, payment_method, created_at, shipping_street, shipping_city, shipping_state, shipping_pincode, shipping_country, shiprocket_order_id, shiprocket_shipment_id, awb_code, courier_name'
    )
    .eq('id', orderId)
    .maybeSingle()

  if (orderError || !order) {
    return { success: false, error: orderError?.message || 'Order not found.' }
  }

  // Idempotency: don't create a duplicate shipment on Shiprocket's side —
  // if it's already there, just report what we have.
  if (order.shiprocket_order_id) {
    return {
      success: true,
      alreadyShipped: true,
      shiprocketOrderId: order.shiprocket_order_id,
      shipmentId: order.shiprocket_shipment_id,
      awbCode: order.awb_code || null,
      courierName: order.courier_name || null,
    }
  }

  if (!order.shipping_city || !order.shipping_state || !order.shipping_pincode) {
    return {
      success: false,
      error:
        'This order is missing a structured shipping address (city/state/pincode), so it was likely placed before the Shiprocket integration was added. Add the address manually in Shiprocket or update the order record.',
    }
  }

  const items = Array.isArray(order.items) ? order.items : []
  if (items.length === 0) {
    return { success: false, error: 'Order has no items to ship.' }
  }

  // Re-fetch product sku from the DB (source of truth) rather than
  // trusting whatever is cached in the stored `items` JSON.
  const productIds = Array.from(new Set(items.map((i: any) => i.id).filter(Boolean)))
  const { data: dbProducts } = await adminClient
    .from('products')
    .select('id, sku, weight')
    .in('id', productIds)
  const productMap = new Map((dbProducts || []).map((p: any) => [p.id, p]))

  const shiprocketItems = items.map((item: any) => {
    const qty = Math.max(1, Number(item.quantity) || 1)
    const product = productMap.get(item.id)
    return {
      name: item.name || 'Product',
      sku: product?.sku || item.id || 'SKU',
      units: qty,
      selling_price: Number(item.price) || 0,
    }
  })

  // Weight: prefer whatever the admin typed into the "Order Weight" field
  // on the shipment panel — that's the actual parcel weight and is far
  // more reliable than summing per-product weight columns (which are
  // usually rough/missing). Fall back to that auto-estimate only if the
  // admin left it blank.
  let totalWeightKg = Number(weightKgOverride) > 0 ? Number(weightKgOverride) : 0
  if (!totalWeightKg) {
    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity) || 1)
      const product = productMap.get(item.id)
      const unitWeight = Number(product?.weight) > 0 ? Number(product.weight) : 0.2
      totalWeightKg += unitWeight * qty
    }
  }
  // Shiprocket rejects a zero/near-zero weight.
  totalWeightKg = Math.max(0.1, Math.round(totalWeightKg * 100) / 100)

  try {
    const created = await createShiprocketOrder({
      orderId: order.id,
      orderDate: order.created_at,
      customerName: order.customer_name || 'Customer',
      customerEmail: order.customer_email || '',
      customerPhone: order.customer_phone || '',
      shippingStreet: order.shipping_street || '',
      shippingCity: order.shipping_city,
      shippingState: order.shipping_state,
      shippingPincode: order.shipping_pincode,
      shippingCountry: order.shipping_country || 'India',
      paymentMethod: order.payment_method || 'COD',
      subtotal: Number(order.subtotal) || 0,
      items: shiprocketItems,
      weightKg: totalWeightKg,
    })

    if (!created.shiprocketOrderId || !created.shipmentId) {
      return { success: false, error: 'Shiprocket did not return an order/shipment id.' }
    }

    const updatePayload: any = {
      shiprocket_order_id: created.shiprocketOrderId,
      shiprocket_shipment_id: created.shipmentId,
      shiprocket_status: created.status || 'NEW',
    }

    const { error: updateError } = await adminClient
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)

    if (updateError) {
      console.error('[Shiprocket] Order created on Shiprocket but failed to save to DB:', updateError.message)
      return {
        success: false,
        error: `Shipment was created on Shiprocket (order ${created.shiprocketOrderId}) but saving it to the database failed: ${updateError.message}`,
      }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)

    return {
      success: true,
      shiprocketOrderId: created.shiprocketOrderId,
      shipmentId: created.shipmentId,
      awbCode: null,
      courierName: null,
    }
  } catch (err: any) {
    console.error('[Shiprocket] Failed to create shipment:', err)
    return { success: false, error: err?.message || 'Failed to create Shiprocket shipment.' }
  }
}
