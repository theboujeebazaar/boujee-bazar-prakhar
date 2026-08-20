import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Shiprocket sends shipment status updates (in transit, out for delivery,
// delivered, RTO, etc.) to this endpoint once you register it under
// Shiprocket → Settings → API → Configure Webhooks, along with a "Secret
// Key" — set that exact same string as SHIPROCKET_WEBHOOK_SECRET below.
// Shiprocket sends that secret back on every webhook call in the
// `x-api-key` header, which is how we verify the request actually came
// from Shiprocket and not a random POST to this public URL.

function mapShiprocketStatusToOrderStatus(currentStatus: string | undefined): string | null {
  if (!currentStatus) return null
  const s = currentStatus.toLowerCase()

  if (s.includes('delivered')) return 'delivered'
  if (s.includes('cancel')) return 'cancelled'
  if (s.includes('rto')) return 'cancelled'
  if (s.includes('out for delivery') || s.includes('in transit') || s.includes('shipped') || s.includes('picked up')) {
    return 'shipped'
  }
  // Pickup generated/scheduled, label generated, etc. — order stays wherever it is
  // (usually 'processing') until it actually moves.
  return null
}

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET
    const receivedKey = req.headers.get('x-api-key')

    if (webhookSecret) {
      if (!receivedKey || receivedKey !== webhookSecret) {
        console.error('[Shiprocket Webhook Error]: Missing/invalid x-api-key header.')
        return NextResponse.json({ success: false, error: 'Invalid webhook secret' }, { status: 401 })
      }
    } else {
      console.warn('[Shiprocket Webhook]: SHIPROCKET_WEBHOOK_SECRET is not configured — accepting request unverified.')
    }

    const payload = await req.json().catch(() => null)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 })
    }

    // The `order_id` Shiprocket echoes back is the same order_id we sent
    // when creating the shipment — our own internal order id (e.g. BB-xxxx).
    const internalOrderId: string | undefined = payload.order_id || payload.channel_order_id
    const awbCode: string | undefined = payload.awb ? String(payload.awb) : undefined
    const currentStatus: string | undefined = payload.current_status || payload.shipment_status

    console.log('[Shiprocket Webhook]: Received update', { internalOrderId, awbCode, currentStatus })

    if (!internalOrderId) {
      // Nothing we can match to an order — acknowledge so Shiprocket
      // doesn't keep retrying, but log it for visibility.
      console.warn('[Shiprocket Webhook]: Payload had no order_id, ignoring.', payload)
      return NextResponse.json({ success: true, ignored: true })
    }

    const supabaseAdmin = createAdminClient()

    const updateData: any = {
      shiprocket_status: currentStatus || null,
    }
    if (awbCode) updateData.awb_code = awbCode

    const mappedStatus = mapShiprocketStatusToOrderStatus(currentStatus)
    if (mappedStatus) updateData.status = mappedStatus

    const { error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', internalOrderId)

    if (error) {
      console.error('[Shiprocket Webhook Error]: DB update failed:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Shiprocket Webhook Critical Error]:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}
