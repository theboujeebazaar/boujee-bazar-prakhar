'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type TrackOrderResult = {
  order_number?: string
  status?: string
  payment_status?: string
  created_at?: string
  total?: number
  found: boolean
}

export async function trackOrder(
  orderNumber: string,
  email?: string
): Promise<TrackOrderResult> {
  const supabase = createAdminClient()
  const number = orderNumber.trim()

  if (!number) return { found: false }

  // Orders are keyed by their `id` (the "BB-XXXX" number customers enter).
  // Only non-sensitive fields are returned; customer PII is never exposed.
  const { data } = await supabase
    .from('orders')
    .select('id, status, payment_status, created_at, total, customer_email')
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
  }
}
