'use client'

import { useState, useEffect } from 'react'
import { User, Phone, MapPin, CheckCircle, Package, Mail, ChevronDown, ChevronUp, ShoppingBag, Truck, CreditCard, ExternalLink, Calendar, ArrowRight } from 'lucide-react'
import { updateCustomerFullProfile } from '@/actions/profile'
import { useToast } from '@/context/ToastContext'
import Link from 'next/link'

type CustomerProfile = {
  fullName: string
  phone: string
  alternatePhone: string
  street: string
  city: string
  state: string
  zipCode: string
}

export default function ProfileManager({ adminProfile, orders = [] }: { adminProfile: any, orders?: any[] }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [profile, setProfile] = useState<CustomerProfile>({
    fullName: '',
    phone: '',
    alternatePhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  })
  const [saved, setSaved] = useState(false)
  const { showToast } = useToast()

  // Load profile data on mount
  useEffect(() => {
    if (adminProfile) {
      setProfile({
        fullName: adminProfile.full_name || '',
        phone: adminProfile.phone || '',
        alternatePhone: adminProfile.alternatePhone || '',
        street: adminProfile.street || '',
        city: adminProfile.city || '',
        state: adminProfile.state || '',
        zipCode: adminProfile.zipCode || '',
      })
    } else if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('gulshan-customer-profile')
      if (savedData) {
        try {
          setProfile(JSON.parse(savedData))
        } catch (e) {
          console.error('Failed to parse profile data', e)
        }
      }
    }
  }, [adminProfile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (adminProfile) {
      const res = await updateCustomerFullProfile(profile)
      if (res.error) {
        showToast(res.error, 'error')
        return
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('gulshan-customer-profile', JSON.stringify(profile))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleChange = (field: keyof CustomerProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId)
  }

  const getStatusColor = (status?: string) => {
    const s = (status || 'pending').toLowerCase()
    switch (s) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'processing':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Premium Tab Navigation Row */}
      <div className="flex border-b border-neutral-100 bg-white p-2 rounded-2xl border border-neutral-100/80 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-[#a68860] text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <User className="w-4 h-4" /> Profile Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
            activeTab === 'orders'
              ? 'bg-[#a68860] text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Package className="w-4 h-4" /> My Orders ({orders.length})
        </button>
      </div>

      {/* Tab Contents: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-xl shadow-neutral-100/30 animate-fade-in">
          <form onSubmit={handleSave} className="space-y-6">
            {saved && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm flex items-center gap-2.5 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-medium">Shipping address and profile saved successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={profile.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="e.g. Sumaiya Khan"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#a68860]/20 focus:border-[#a68860] transition-all text-sm text-neutral-800"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={adminProfile?.email || ''}
                    placeholder="e.g. customer@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed focus:outline-none text-sm"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={profile.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#a68860]/20 focus:border-[#a68860] transition-all text-sm text-neutral-800"
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                  Alternate Phone <span className="text-neutral-400 normal-case font-medium">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.alternatePhone}
                    onChange={(e) => handleChange('alternatePhone', e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#a68860]/20 focus:border-[#a68860] transition-all text-sm text-neutral-800"
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-6 space-y-4">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#a68860]" /> Default Shipping Address
              </h3>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={profile.street}
                  onChange={(e) => handleChange('street', e.target.value)}
                  placeholder="e.g. Apartment, Suite, Block number"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#a68860]/20 focus:border-[#a68860] transition-all text-sm text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#a68860]/20 focus:border-[#a68860] transition-all text-sm text-neutral-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="e.g. Delhi"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#a68860]/20 focus:border-[#a68860] transition-all text-sm text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                  PIN Code / ZIP Code
                </label>
                <input
                  type="text"
                  required
                  value={profile.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  placeholder="e.g. 110001"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#a68860]/20 focus:border-[#a68860] transition-all text-sm text-neutral-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-neutral-950 text-white font-semibold rounded-xl hover:bg-neutral-850 transition-all text-sm shadow-sm"
            >
              Save Account Details
            </button>
          </form>
        </div>
      )}

      {/* Tab Contents: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fade-in">
          {orders && orders.length > 0 ? (
            orders.map((order) => {
              const isExpanded = expandedOrderId === order.id
              const dateObj = new Date(order.created_at)
              const orderItems: any[] = order.items || []

              return (
                <div 
                  key={order.id} 
                  className={`bg-white border rounded-2xl transition-all duration-300 ${
                    isExpanded 
                      ? 'border-[#a68860]/40 shadow-md ring-1 ring-[#a68860]/10' 
                      : 'border-neutral-100 shadow-sm hover:border-neutral-200'
                  }`}
                >
                  {/* Order Card Summary Bar */}
                  <div className="p-5 flex flex-wrap gap-y-3 justify-between items-center select-none">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 max-w-full">
                        <span className="font-bold text-sm text-neutral-900 truncate max-w-[130px] xs:max-w-[170px] sm:max-w-none block" title={order.order_number || order.id}>
                          #{order.order_number || order.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-bold tracking-wide uppercase text-[9px] border shrink-0 ${getStatusColor(order.status || order.order_status)}`}>
                          {order.status || order.order_status || 'pending'}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#a68860]/60" />
                        {dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Amount</span>
                        <span className="font-bold text-sm text-neutral-850">
                          ₹{(order.total ?? order.total_amount ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleOrderDetails(order.id)}
                        className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                          isExpanded 
                            ? 'bg-[#a68860]/10 border-[#a68860]/20 text-[#a68860]' 
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                        }`}
                      >
                        {isExpanded ? (
                          <>Hide Details <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>View Details <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Complete Order Details Drawer */}
                  {isExpanded && (
                    <div className="border-t border-neutral-100 bg-[#FCFBF9]/60 p-5 rounded-b-2xl space-y-6 animate-slide-down">
                      
                      {/* 1. Items List */}
                      <div className="space-y-3">
                        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#a68860]" /> Order Pieces ({orderItems.length})
                        </h4>
                        
                        <div className="divide-y divide-neutral-100/60 bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-2xs">
                          {orderItems.map((item: any, idx: number) => (
                            <div key={item.id || idx} className="p-4 flex gap-4 items-center">
                              {item.image_url || item.image ? (
                                <div className="relative w-12 h-15 bg-neutral-50 rounded-lg overflow-hidden shrink-0 border border-neutral-200/50">
                                  <img 
                                    src={item.image_url || item.image} 
                                    alt={item.name} 
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-15 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0 border border-neutral-200/50 text-[10px] text-neutral-400 font-bold uppercase">
                                  Piece
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-xs text-neutral-800 truncate">
                                  {item.name}
                                </h5>
                                {item.variant_name && (
                                  <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-[#a68860] bg-[#FBF7F0] border border-[#a68860]/20 px-1.5 py-0.5 rounded">
                                    {item.variant_color_hex && (
                                      <span
                                        className="w-2 h-2 rounded-full border border-black/10 shrink-0"
                                        style={{ backgroundColor: item.variant_color_hex }}
                                      />
                                    )}
                                    {item.variant_name}
                                  </span>
                                )}
                                <div className="text-[11px] text-neutral-500 mt-1">
                                  Qty: <span className="font-semibold text-neutral-800">{item.quantity}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-xs text-neutral-900">
                                  ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}
                                </div>
                                <div className="text-[10px] text-neutral-400 font-medium">
                                  ₹{(Number(item.price) || 0).toLocaleString('en-IN')} each
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* 2. Shipping Address */}
                        <div className="bg-white border border-neutral-100 rounded-xl p-4 space-y-2.5 shadow-2xs">
                          <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#a68860]" /> Delivery Address
                          </h4>
                          <div className="text-xs text-neutral-800 leading-relaxed font-semibold">
                            {order.customer_name || 'Premium Collector'}
                          </div>
                          {order.customer_phone && (
                            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-neutral-400" /> {order.customer_phone}
                            </div>
                          )}
                          <div className="text-[11px] text-neutral-600 leading-relaxed flex items-start gap-1.5">
                            <MapPin className="w-3 h-3 text-[#a68860]/70 shrink-0 mt-0.5" />
                            <span>{order.shipping_address || `${order.shipping_street || ''}, ${order.shipping_city || ''}, ${order.shipping_state || ''} - ${order.shipping_pincode || ''}`}</span>
                          </div>
                        </div>

                        {/* 3. Cost & Payment Details */}
                        <div className="bg-white border border-neutral-100 rounded-xl p-4 space-y-3.5 shadow-2xs">
                          <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-[#a68860]" /> Payment & Charges
                          </h4>
                          
                          <div className="space-y-1.5 text-xs text-neutral-600">
                            {order.subtotal !== undefined && (
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold text-neutral-800">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            {order.discount !== undefined && Number(order.discount) > 0 && (
                              <div className="flex justify-between text-rose-600 font-semibold">
                                <span>Discount</span>
                                <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            {order.shipping_fee !== undefined && (
                              <div className="flex justify-between">
                                <span>Shipping Fee</span>
                                <span className="font-semibold text-neutral-800">
                                  {Number(order.shipping_fee) === 0 ? 'Free' : `₹${Number(order.shipping_fee).toLocaleString('en-IN')}`}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-bold text-neutral-900 border-t border-neutral-100 pt-2.5 mt-1.5">
                              <span>Grand Total</span>
                              <span className="text-[#a68860]">₹{(order.total ?? order.total_amount ?? 0).toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1.5 border-t border-neutral-50 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200/60 px-2 py-0.5 rounded">
                              {order.payment_method || 'COD'}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded ${
                              (order.payment_status || 'pending').toLowerCase() === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                                : 'bg-amber-50 text-amber-700 border-amber-250'
                            }`}>
                              {(order.payment_status || 'pending').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4. Tracking and Actions */}
                      <div className="pt-2 flex flex-wrap gap-3">
                        <Link 
                          href={`/track-order?order=${encodeURIComponent(order.id)}`}
                          className="flex items-center gap-1.5 bg-neutral-950 text-white hover:bg-neutral-800 transition-all font-semibold text-xs py-2.5 px-4 rounded-xl shadow-2xs"
                        >
                          Track Shipment <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-neutral-100 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 bg-neutral-50 text-neutral-400 border border-neutral-200/60 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-neutral-900">No Orders Found</h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                  You haven't placed any orders yet. Explore our luxury jewelry collection to find your perfect statement pieces!
                </p>
              </div>
              <div className="pt-2">
                <Link 
                  href="/shop"
                  className="inline-flex items-center gap-1.5 py-2.5 px-5 bg-neutral-950 text-white font-semibold text-xs rounded-xl hover:bg-neutral-800 transition-all shadow-sm"
                >
                  Start Shopping <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
