import { getOrderById } from '@/actions/orders'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Check, Search, Calendar, CreditCard, Tag, Package, ShoppingBag, ArrowRight } from 'lucide-react'

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
      <main className="min-h-screen bg-[#FCFBF9] pt-32 pb-20 md:pt-40 md:pb-28" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-5">
          {missing ? (
            <div className="bg-white rounded-3xl p-10 border border-neutral-100 shadow-xl shadow-neutral-100/50 text-center space-y-8 animate-fade-in">
              <div className="w-20 h-20 bg-neutral-50 text-neutral-400 border border-neutral-200/60 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Search className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h1 className="font-display font-bold text-3xl text-neutral-900 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Order Not Found
                </h1>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  We couldn't locate an order matching this reference. It might have been processed recently or entered incorrectly.
                </p>
              </div>
              <div className="pt-4 max-w-sm mx-auto space-y-3">
                <Link
                  href="/track-order"
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-neutral-950 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-all text-sm shadow-sm"
                >
                  Track an Order
                </Link>
                <Link 
                  href="/" 
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-6 border border-[#a68860] text-[#a68860] hover:bg-[#FBF7F0] font-semibold rounded-xl transition-all text-sm"
                >
                  Return to Store
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Success Hero Card */}
              <div className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-100 shadow-xl shadow-neutral-100/40 text-center space-y-6 relative overflow-hidden">
                {/* Decorative absolute element */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#a68860] to-transparent" />
                
                {/* Checkmark Ring */}
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 bg-[#a68860]/10 rounded-full animate-ping opacity-75" />
                  <div className="relative w-20 h-20 bg-gradient-to-tr from-[#a68860] to-[#c5a880] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#a68860]/20">
                    <Check className="w-10 h-10 stroke-[3]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-widest text-[#a68860] uppercase">Thank You</span>
                  <h1 className="font-display font-bold text-3xl md:text-4xl text-neutral-900 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Order Placed Successfully!
                  </h1>
                  <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                    Your luxury pieces are being prepared. A confirmation summary of order has been saved.
                  </p>
                </div>

                {/* Info Grid */}
                <div className="mt-8 bg-[#FDFCFB] rounded-2xl border border-[#a68860]/10 p-6 md:p-8 text-left grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                  
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      <Tag className="w-3.5 h-3.5 text-[#a68860]/70" /> Order Number
                    </span>
                    <span className="font-mono font-bold text-sm text-neutral-800 break-all select-all">
                      {order.id}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      <Calendar className="w-3.5 h-3.5 text-[#a68860]/70" /> Placed On
                    </span>
                    <span className="font-bold text-sm text-neutral-800">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#a68860]/70" /> Grand Total
                    </span>
                    <span className="font-bold text-base text-[#a68860]">
                      ₹{(order.total || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      <CreditCard className="w-3.5 h-3.5 text-[#a68860]/70" /> Payment Method
                    </span>
                    <span className="font-bold text-sm text-neutral-800 uppercase">
                      {order.payment_method || 'COD'}
                    </span>
                  </div>

                  <div className="sm:col-span-2 border-t border-[#a68860]/10 pt-4 mt-2 flex flex-wrap gap-y-3 justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 font-semibold uppercase">Payment:</span>
                      <span className={`px-2.5 py-1 rounded-md font-bold tracking-wide uppercase text-[10px] ${
                        order.payment_status === 'paid' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.payment_status || 'pending'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 font-semibold uppercase">Order Status:</span>
                      <span className={`px-2.5 py-1 rounded-md font-bold tracking-wide uppercase text-[10px] ${
                        order.status === 'delivered' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-neutral-50 text-neutral-600 border border-neutral-200/60'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Link
                    href={`/track-order?order=${encodeURIComponent(order.id)}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-neutral-950 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-all text-sm shadow-sm"
                  >
                    <Package className="w-4 h-4" /> Track My Order
                  </Link>
                  <Link 
                    href="/" 
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-6 border-2 border-[#a68860] text-[#a68860] hover:bg-[#FBF7F0] font-semibold rounded-xl transition-all text-sm"
                  >
                    Continue Shopping <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
