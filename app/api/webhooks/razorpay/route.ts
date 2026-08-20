import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmationEmail } from '@/lib/brevo'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('[Razorpay Webhook Error]: RAZORPAY_WEBHOOK_SECRET is not configured on server.')
      return NextResponse.json(
        { success: false, error: 'Webhook secret is not configured on server environment' },
        { status: 500 }
      )
    }

    if (!signature) {
      console.error('[Razorpay Webhook Error]: Missing x-razorpay-signature header.')
      return NextResponse.json(
        { success: false, error: 'Missing x-razorpay-signature header' },
        { status: 400 }
      )
    }

    // Verify HMAC SHA-256 signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    const signatureBuffer = Buffer.from(signature, 'utf8')
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')

    let isValid = false
    if (signatureBuffer.length === expectedBuffer.length) {
      isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    }

    if (!isValid) {
      console.error('[Razorpay Webhook Error]: Signature mismatch. Untrusted webhook payload received.')
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    // Parse verified payload
    const eventData = JSON.parse(rawBody)
    const event = eventData.event
    const payload = eventData.payload

    console.log(`[Razorpay Webhook]: Received valid event '${event}'`)

    const supabaseAdmin = createAdminClient()

    const settlePaidOrder = async (orderId: string, razorpayPaymentId?: string) => {
      const updateData: any = {
        payment_status: 'paid',
        status: 'confirmed',
        notes: `Paid via Razorpay Webhook${razorpayPaymentId ? ` (Txn: ${razorpayPaymentId})` : ''}`,
      }
      if (razorpayPaymentId) updateData.razorpay_payment_id = razorpayPaymentId

      const { data: updatedOrders, error: updateErr } = await supabaseAdmin
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('payment_status', 'pending')
        .select('items, customer_name, customer_email, subtotal, shipping_fee, discount, total, payment_method, shipping_address')

      if (updateErr) {
        console.error('[Razorpay Webhook Error]: DB update failed while settling order:', updateErr.message)
        return
      }

      if (!updatedOrders || updatedOrders.length === 0) return

      const settledOrder = updatedOrders[0]
      const orderItems = settledOrder?.items || []
      for (const item of orderItems) {
        if (!item?.id) continue
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .maybeSingle()

        if (product) {
          const currentStock = Number(product.stock) || 0
          const orderedQty = Number(item.quantity) || 1
          const newStock = Math.max(0, currentStock - orderedQty)
          await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', item.id).gte('stock', orderedQty)
        }
      }

      try {
        await sendOrderConfirmationEmail({
          id: orderId,
          customer_name: settledOrder.customer_name,
          customer_email: settledOrder.customer_email,
          items: orderItems,
          subtotal: settledOrder.subtotal,
          shipping_fee: settledOrder.shipping_fee,
          discount: settledOrder.discount,
          total: settledOrder.total,
          payment_method: settledOrder.payment_method,
          shipping_address: settledOrder.shipping_address,
        })
      } catch (e) {
        console.warn('[Razorpay Webhook]: Failed to send order confirmation email:', e)
      }
    }

    switch (event) {
      case 'payment.captured': {
        const payment = payload?.payment?.entity
        if (!payment) break

        const razorpayPaymentId = payment.id
        const razorpayOrderId = payment.order_id
        const internalOrderId = payment.notes?.internal_order_id || payment.notes?.order_id || payment.receipt

        console.log(`[Razorpay Webhook]: Processing payment.captured for payment ${razorpayPaymentId}, order ${razorpayOrderId}, internal order ${internalOrderId}`)

        if (internalOrderId) {
          await settlePaidOrder(internalOrderId, razorpayPaymentId)
          console.log(`[Razorpay Webhook]: Order settled as PAID & CONFIRMED for payment ${razorpayPaymentId}`)
        }
        break
      }

      case 'payment.failed': {
        const payment = payload?.payment?.entity
        if (!payment) break

        const razorpayPaymentId = payment.id
        const internalOrderId = payment.notes?.internal_order_id || payment.notes?.order_id || payment.receipt
        const errorDescription = payment.error_description || 'Payment transaction failed'

        console.log(`[Razorpay Webhook]: Processing payment.failed for payment ${razorpayPaymentId}, reason: ${errorDescription}`)

        if (internalOrderId) {
          const { error: updateErr } = await supabaseAdmin.from('orders').update({
            payment_status: 'failed',
            notes: `Payment Failed: ${errorDescription}`,
          }).eq('id', internalOrderId)

          if (updateErr) {
            console.error('[Razorpay Webhook Error]: DB update failed for payment.failed:', updateErr.message)
          }
        }
        break
      }

      case 'order.paid': {
        const orderEntity = payload?.order?.entity
        if (!orderEntity) break

        const razorpayOrderId = orderEntity.id
        const internalOrderId = orderEntity.receipt || orderEntity.notes?.internal_order_id || orderEntity.notes?.order_id

        console.log(`[Razorpay Webhook]: Processing order.paid for razorpay order ${razorpayOrderId}, internal order ${internalOrderId}`)

        if (internalOrderId) {
          await settlePaidOrder(internalOrderId)
          console.log(`[Razorpay Webhook]: Order settled as PAID & CONFIRMED for razorpay order ${razorpayOrderId}`)
        }
        break
      }

      default:
        console.log(`[Razorpay Webhook]: Unhandled event type '${event}' acknowledged.`)
        break
    }

    return NextResponse.json({ success: true, event }, { status: 200 })
  } catch (error: any) {
    console.error('[Razorpay Webhook Critical Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
