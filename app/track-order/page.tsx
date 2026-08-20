'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import { trackOrder } from '@/actions/orders'

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [trackingInfo, setTrackingInfo] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialOrder = params.get('order')
    if (initialOrder) {
      setOrderNumber(initialOrder.trim().toUpperCase())
    }
  }, [])

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) {
      setErrorMsg('Please enter a valid order number.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setTrackingInfo(null)

    try {
      const res = await trackOrder(orderNumber.trim(), email.trim() || undefined)

      if (!res.found) {
        setErrorMsg('Order not found. Please double-check your order number (e.g. BB-1002).')
      } else {
        setTrackingInfo({
          order_number: res.order_number,
          order_status: res.status,
          payment_status: res.payment_status,
          total_amount: res.total,
          created_at: res.created_at,
          awb_code: res.awb_code,
          courier_name: res.courier_name,
          tracking_url: res.tracking_url,
          shiprocket_status: res.shiprocket_status,
        })
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusStep = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'pending' || s === 'confirmed') return 0
    const steps = ['processing', 'shipped', 'delivered']
    return steps.indexOf(s)
  }

  const activeStep = trackingInfo ? getStatusStep(trackingInfo.order_status) : -1

  return (
    <main className="overflow-x-hidden pt-[72px] md:pt-[84px] bg-white min-h-screen flex flex-col font-body">
      <Header />

      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-16 md:py-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="eyebrow justify-center inline-flex items-center gap-2 text-[#c5a880] uppercase tracking-widest text-xs font-semibold">
            <span className="h-px w-6 bg-[#c5a880]/50" />
            Live Updates
            <span className="h-px w-6 bg-[#c5a880]/50" />
          </div>
          <h1 className="text-4xl font-display font-bold text-neutral-900 mt-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Track Your Order
          </h1>
          <p className="mt-2 text-neutral-500 text-sm">
            Enter your order number to track your shipment status in real-time.
          </p>
        </div>

        {/* Search form */}
        <div className="bg-neutral-50 rounded-[32px] border border-neutral-100 p-6 md:p-8 max-w-lg mx-auto">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Order Number</label>
              <input
                type="text"
                placeholder="e.g. BB-1024"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 focus:border-neutral-900 outline-none text-sm font-medium transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 focus:border-neutral-900 outline-none text-sm font-medium transition-all"
              />
            </div>
            {errorMsg && <p className="text-red-500 text-xs font-medium">{errorMsg}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Tracking results */}
        {trackingInfo && (
          <div className="mt-12 bg-white rounded-[32px] border border-neutral-100 p-6 md:p-8 shadow-sm max-w-xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <div>
                <h3 className="font-semibold text-neutral-800">Order #{trackingInfo.order_number}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Placed on {new Date(trackingInfo.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#c5a880] bg-[#c5a880]/5 px-3.5 py-1.5 rounded-full">
                {trackingInfo.order_status}
              </span>
            </div>

            {/* Tracking Status Steps */}
            <div className="relative flex justify-between items-center">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-100 -translate-y-1/2 -z-10" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-[#c5a880] -translate-y-1/2 -z-10 transition-all duration-500"
                style={{ width: `${(activeStep / 3) * 100}%` }}
              />

              {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                const isActive = idx <= activeStep
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-[#c5a880] border-[#c5a880] text-white shadow-sm'
                          : 'bg-white border-neutral-200 text-neutral-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`}>
                      {step}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Courier / AWB tracking, once the order has shipped */}
            {trackingInfo.awb_code ? (
              <div className="bg-[#c5a880]/5 border border-[#c5a880]/20 rounded-2xl p-4 text-xs text-neutral-600 space-y-2">
                <p><strong>Courier:</strong> {trackingInfo.courier_name || 'Assigned'}</p>
                <p><strong>AWB / Tracking No.:</strong> {trackingInfo.awb_code}</p>
                {trackingInfo.shiprocket_status && (
                  <p><strong>Latest Status:</strong> {trackingInfo.shiprocket_status}</p>
                )}
                <a
                  href={trackingInfo.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full mt-2 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Track Live Shipment
                </a>
              </div>
            ) : (
              <div className="bg-neutral-50 rounded-2xl p-4 text-xs text-neutral-500 space-y-2">
                <p><strong>Payment Status:</strong> {trackingInfo.payment_status.toUpperCase()}</p>
                <p><strong>Estimated Delivery:</strong> 3-5 business days from dispatch.</p>
                {['shipped', 'processing'].includes((trackingInfo.order_status || '').toLowerCase()) && (
                  <p>Your parcel is being prepared for dispatch — a tracking number will appear here once it's picked up by the courier.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
      <FloatingWhatsApp />
    </main>
  )
}
