import { getOrderById } from '@/actions/orders'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { CheckCircle2, Search } from 'lucide-react'

export const metadata = {
  title: 'Order Confirmed | The Boujee Bazaar',
  description: 'Your order has been placed successfully with The Boujee Bazaar.',
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: any
}) {
  const resolvedSearchParams = typeof searchParams?.then === 'function' ? await searchParams : searchParams
  const orderId = typeof resolvedSearchParams?.orderId === 'string' ? resolvedSearchParams.orderId.trim() : ''

  let order: any = null
  if (orderId) {
    order = await getOrderById(orderId)
  }

  const missing = !orderId || !order

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-28 pb-16 md:pt-36 md:pb-24" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="max-w-xl mx-auto px-5">
          {missing ? (
            <div className="bg-white rounded-3xl p-8 border border-cream-line shadow-card text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-cream text-neutral-400 border border-cream-line rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-neutral-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Order Not Found
                </h1>
                <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
                  We couldn't find an order matching that reference. The link may be incorrect or the order may have been removed.
                </p>
              </div>
              <div className="space-y-2">
                <Link
                  href="/track-order"
                  className="block w-full py-3 px-4 bg-emerald text-cream font-body font-semibold rounded-full shadow-card hover:bg-emerald-deep transition-all text-sm"
                >
                  Track an Order
                </Link>
                <Link href="/" className="block w-full py-3 text-sm text-neutral-500 hover:text-neutral-900 font-semibold transition-colors">
                  Return to Store
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-cream-line shadow-card text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald text-cream rounded-full flex items-center justify-center mx-auto shadow-card">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl text-neutral-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Order Placed Successfully!
                </h1>
                <p className="text-sm text-neutral-500 mt-1">Thank you for shopping with The Boujee Bazaar.</p>
              </div>
              <div className="p-4 bg-cream/60 rounded-2xl border border-cream-line text-left space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 uppercase font-semibold">Order Number</span>
                  <span className="font-mono font-bold text-neutral-900">{order.id}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 uppercase font-semibold">Placed On</span>
                  <span className="font-bold text-neutral-900">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 uppercase font-semibold">Grand Total</span>
                  <span className="font-bold text-neutral-900">₹{(order.total || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 uppercase font-semibold">Payment Method</span>
                  <span className="font-bold text-neutral-900">{order.payment_method || 'COD'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 uppercase font-semibold">Payment Status</span>
                  <span className="font-bold text-neutral-900">{(order.payment_status || 'pending').toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 uppercase font-semibold">Order Status</span>
                  <span className="font-bold text-neutral-900">{(order.status || 'pending').toUpperCase()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  href={`/track-order?order=${encodeURIComponent(order.id)}`}
                  className="block w-full py-3 px-4 bg-emerald text-cream font-body font-semibold rounded-full shadow-card hover:bg-emerald-deep transition-all text-sm"
                >
                  Track My Order
                </Link>
                <Link href="/" className="block w-full py-3 text-sm text-neutral-500 hover:text-neutral-900 font-semibold transition-colors">
                  Return to Store
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
