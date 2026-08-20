'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type TrackOrderResult = {
  order_number?: string
  status?: string
  payment_status?: string
  created_at?: string
  total?: number
  found: boolean
  // Shiprocket shipment info — populated once the order has been shipped
  // (via the admin "Ship via Shiprocket" action) and, for awb/courier/
  // status, kept up to date by the Shiprocket webhook as the parcel moves.
  shiprocket_status?: string | null
  awb_code?: string | null
  courier_name?: string | null
  tracking_url?: string | null
}

export async function trackOrder(
  orderNumber: string,
  email?: string
): Promise<TrackOrderResult> {
  const supabase = createAdminClient()
  const number = orderNumber.trim().toUpperCase()

  if (!number) return { found: false }

  // Orders are keyed by their `id` (the "BB-XXXX" number customers enter).
  // Only non-sensitive fields are returned; customer PII is never exposed.
  const { data } = await supabase
    .from('orders')
    .select('id, status, payment_status, created_at, total, customer_email, shiprocket_status, awb_code, courier_name')
    .eq('id', number)
    .maybeSingle()

  if (!data) return { found: false }

  // If an email was supplied, require it to match before returning anything.
  if (email && email.trim() && email.trim().toLowerCase() !== (data.customer_email || '').toLowerCase()) {
    return { found: false }
  }

  return {
    order_number: data.id,
    status: data.status,
    payment_status: data.payment_status,
    created_at: data.created_at,
    total: Number(data.total || 0),
    found: true,
    shiprocket_status: data.shiprocket_status || null,
    awb_code: data.awb_code || null,
    courier_name: data.courier_name || null,
    tracking_url: data.awb_code ? `https://shiprocket.co/tracking/${data.awb_code}` : null,
  }
}

export async function getOrderById(orderId: string) {
  if (!orderId) return null
  const supabase = createAdminClient()
  const id = orderId.trim()
  if (!id) return null

  const { data } = await supabase
    .from('orders')
    .select('id, status, payment_status, total, created_at, payment_method, customer_name, items')
    .eq('id', id)
    .maybeSingle()

  if (!data) return null

  return {
    id: data.id,
    status: data.status,
    payment_status: data.payment_status,
    total: Number(data.total || 0),
    created_at: data.created_at,
    payment_method: data.payment_method,
    customer_name: data.customer_name,
    items: data.items || [],
  }
}
