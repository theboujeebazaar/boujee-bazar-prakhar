'use client'

import { useTransition, useState } from 'react'
import { updateShippingSettings } from '@/actions/admin/shipping'
import { Truck, CircleDollarSign, CheckCircle, Banknote, CreditCard, ShieldCheck } from 'lucide-react'

export default function ShippingForm({ initialShipping }: { initialShipping: any }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [enableCod, setEnableCod] = useState<boolean>(initialShipping.enable_cod !== false)
  const [enableOnline, setEnableOnline] = useState<boolean>(initialShipping.enable_online !== false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const flatRate = parseFloat(formData.get('flatRate') as string)
    const freeThreshold = parseFloat(formData.get('freeThreshold') as string)
    const codCharge = parseFloat(formData.get('codCharge') as string)
    const onlineDiscount = parseFloat(formData.get('onlineDiscount') as string)

    if (isNaN(flatRate) || isNaN(freeThreshold) || isNaN(codCharge) || isNaN(onlineDiscount)) {
      setMessage({ type: 'error', text: 'Please enter valid numbers.' })
      return
    }

    if (!enableCod && !enableOnline) {
      setMessage({ type: 'error', text: 'At least one payment method (COD or Online) must be enabled.' })
      return
    }

    startTransition(async () => {
      const res = await updateShippingSettings(flatRate, freeThreshold, codCharge, onlineDiscount, enableCod, enableOnline)
      if (res.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Shipping & Payment settings updated successfully!' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Payment Gateway Activation Toggles - Premium Responsive Card UI */}
      <div className="bg-stone-50/70 p-4 sm:p-5 md:p-6 rounded-2xl border border-stone-200/80 space-y-3.5 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100/80 text-teal-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">Payment Gateways Status</h3>
              <p className="text-[11px] sm:text-xs text-stone-500">Enable or disable payment options for customer checkout</p>
            </div>
          </div>
        </div>
        
        {/* COD Toggle Card */}
        <div className={`p-3.5 sm:p-4 bg-white rounded-xl border transition-all duration-200 ${
          enableCod 
            ? 'border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/10' 
            : 'border-stone-200/90 opacity-80'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                enableCod ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-400'
              }`}>
                <Banknote className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug">Cash on Delivery (COD)</span>
                  {enableCod ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-stone-100 text-stone-500 border border-stone-200 shrink-0">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">Allow customers to pay COD upon doorstep delivery</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEnableCod(!enableCod)}
              className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none mt-0.5 sm:mt-0 ${
                enableCod ? 'bg-teal-700 shadow-inner' : 'bg-stone-300'
              }`}
              aria-label="Toggle Cash on Delivery"
            >
              <span
                className={`pointer-events-none block h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
                  enableCod ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Razorpay Online Payment Toggle Card */}
        <div className={`p-3.5 sm:p-4 bg-white rounded-xl border transition-all duration-200 ${
          enableOnline 
            ? 'border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/10' 
            : 'border-stone-200/90 opacity-80'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                enableOnline ? 'bg-indigo-50 text-indigo-700' : 'bg-stone-100 text-stone-400'
              }`}>
                <CreditCard className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug">Online Payment (Razorpay)</span>
                  {enableOnline ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-stone-100 text-stone-500 border border-stone-200 shrink-0">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">Allow customers to pay instantly via UPI, Credit/Debit Cards, Netbanking</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEnableOnline(!enableOnline)}
              className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none mt-0.5 sm:mt-0 ${
                enableOnline ? 'bg-teal-700 shadow-inner' : 'bg-stone-300'
              }`}
              aria-label="Toggle Online Payment"
            >
              <span
                className={`pointer-events-none block h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
                  enableOnline ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Flat Shipping Rate (₹)
        </label>
        <div className="relative">
          <input
            type="number"
            name="flatRate"
            defaultValue={initialShipping.flat_rate ?? 99}
            required
            min="0"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-[#c5a880] transition-all"
          />
          <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Free Shipping Threshold (₹)
        </label>
        <div className="relative">
          <input
            type="number"
            name="freeThreshold"
            defaultValue={initialShipping.free_threshold ?? 1999}
            required
            min="0"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-[#c5a880] transition-all"
          />
          <CircleDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Cash on Delivery (COD) Charge (₹)
        </label>
        <div className="relative">
          <input
            type="number"
            name="codCharge"
            defaultValue={initialShipping.cod_charge ?? 50}
            required
            min="0"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-[#c5a880] transition-all"
          />
          <CircleDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Online Payment Discount (%)
        </label>
        <div className="relative">
          <input
            type="number"
            name="onlineDiscount"
            defaultValue={initialShipping.online_discount ?? 0}
            required
            min="0"
            max="100"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-[#c5a880] transition-all"
          />
          <CircleDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white font-semibold rounded-xl shadow-md shadow-teal-700/20 hover:shadow-lg hover:from-teal-800 hover:to-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {pending ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-4.5 h-4.5" />
            Save Shipping & Payment Settings
          </>
        )}
      </button>
    </form>
  )
}
