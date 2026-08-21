
// 'use client'

// import React, { useState, useEffect, useTransition } from 'react'
// import { useCart } from '@/context/CartContext'
// import { useToast } from '@/context/ToastContext'
// import { validateCoupon } from '@/actions/admin/coupons'
// import { processCheckout, verifyRazorpayPayment } from '@/actions/checkout'
// import { sendEmailOtp, verifyEmailOtp } from '@/actions/auth'
// import { SITE } from '@/lib/data'
// import { Truck, Tag, CreditCard, ShoppingBag, ShieldCheck, CheckCircle2, Lock, Eye, EyeOff, Plus, Minus, X, Loader2 } from 'lucide-react'
// import Image from 'next/image'
// import Link from 'next/link'
// import Script from 'next/script'
// import { createClient } from '@/lib/supabase/client'

// type ShippingSettings = {
//   flat_rate: number
//   free_threshold: number
//   cod_charge?: number
//   online_discount?: number
// }

// export default function CheckoutForm({ shipping, isLoggedIn }: { shipping: ShippingSettings, isLoggedIn: boolean }) {
//   const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart()
//   const { showToast } = useToast()
//   const [pending, startTransition] = useTransition()

//   // Shipping Address Form State
//   const [profile, setProfile] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     alternatePhone: '',
//     street: '',
//     city: '',
//     state: '',
//     zipCode: '',
//   })

//   // OTP States for Guest Checkout
//   const [otpSent, setOtpSent] = useState(false)
//   const [otpCode, setOtpCode] = useState('')
//   const [otpPending, setOtpPending] = useState(false)
//   const [resendTimer, setResendTimer] = useState(60)
//   const [otpError, setOtpError] = useState('')

//   useEffect(() => {
//     let interval: NodeJS.Timeout
//     if (otpSent && resendTimer > 0) {
//       interval = setInterval(() => {
//         setResendTimer((prev) => prev - 1)
//       }, 1000)
//     }
//     return () => clearInterval(interval)
//   }, [otpSent, resendTimer])

//   useEffect(() => {
//     if (otpSent) {
//       setResendTimer(60)
//     }
//   }, [otpSent])

//   // Temporarily lower header z-index and freeze scrolling when OTP modal is open
//   useEffect(() => {
//     const header = document.querySelector('header')
//     if (otpSent && !isLoggedIn) {
//       if (header) {
//         header.style.zIndex = '0'
//       }
//       document.body.style.overflow = 'hidden'
//     } else {
//       if (header) {
//         header.style.zIndex = ''
//       }
//       document.body.style.overflow = ''
//     }
//     return () => {
//       if (header) {
//         header.style.zIndex = ''
//       }
//       document.body.style.overflow = ''
//     }
//   }, [otpSent, isLoggedIn])

//   // Coupon State
//   const [couponCode, setCouponCode] = useState('')
//   const [activeCoupon, setActiveCoupon] = useState<any>(null)
//   const [couponError, setCouponError] = useState('')
//   const [couponSuccess, setCouponSuccess] = useState('')

//   // Payment Method
//   const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Online Payment (Razorpay)'>('Cash on Delivery')

//   // Success Modal State
//   const [placedOrder, setPlacedOrder] = useState<any>(null)

//   // 1. ✅ UPDATED: Prefill from local storage using your jewelry brand tracking token keys
//   useEffect(() => {
//     if (typeof window !== 'undefined' && isLoggedIn) {
//       const savedData = localStorage.getItem('boujee-customer-profile') || localStorage.getItem('gulshan-customer-profile')
//       if (savedData) {
//         try {
//           const parsed = JSON.parse(savedData)
//           setProfile({
//             fullName: parsed.fullName || '',
//             email: parsed.email || '',
//             phone: parsed.phone || '',
//             alternatePhone: parsed.alternatePhone || '',
//             street: parsed.street || '',
//             city: parsed.city || '',
//             state: parsed.state || '',
//             zipCode: parsed.zipCode || '',
//           })
//         } catch (e) {
//           console.error(e)
//         }
//       }
//     }
//   }, [isLoggedIn])

//   // Load user profile and default address from database if logged in
//   useEffect(() => {
//     if (isLoggedIn) {
//       const supabase = createClient()
//       if (supabase) {
//         supabase.auth.getUser().then(async ({ data }) => {
//           if (data?.user) {
//             const { data: profileData } = await supabase
//               .from('profiles')
//               .select('*')
//               .eq('id', data.user.id)
//               .single()
            
//             const { data: addressData } = await supabase
//               .from('addresses')
//               .select('*')
//               .eq('user_id', data.user.id)
//               .order('is_default', { ascending: false })
//               .limit(1)
//               .maybeSingle()

//             setProfile({
//               fullName: profileData?.full_name || '',
//               email: data.user.email || '',
//               phone: addressData?.phone || profileData?.phone || '',
//               alternatePhone: addressData?.alternate_phone || '',
//               street: addressData?.address_line_1 || '',
//               city: addressData?.city || '',
//               state: addressData?.state || '',
//               zipCode: addressData?.postal_code || '',
//             })
//           }
//         }).catch((err) => console.error('Failed to load profile in checkout:', err))
//       }
//     }
//   }, [isLoggedIn])

//   // Calculate checkout details
//   const subtotal = cartTotal
//   const shippingFee = subtotal >= (shipping.free_threshold ?? 1499) ? 0 : (shipping.flat_rate ?? 99)
//   const codFee = paymentMethod === 'Cash on Delivery' ? (shipping.cod_charge ?? 50) : 0
//   let discount = 0
//   if (activeCoupon) {
//     if (activeCoupon.type === 'percentage') {
//       discount = Math.round((subtotal * activeCoupon.value) / 100)
//     } else {
//       discount = activeCoupon.value
//     }
//   }
//   const onlineDiscountPercent = shipping.online_discount ?? 0
//   const onlineDiscountAmount = paymentMethod === 'Online Payment (Razorpay)'
//     ? Math.round((subtotal * onlineDiscountPercent) / 100)
//     : 0
//   const grandTotal = Math.max(0, subtotal + shippingFee + codFee - discount - onlineDiscountAmount)

//   // Handle Coupon Apply
//   const handleApplyCoupon = async () => {
//     setCouponError('')
//     setCouponSuccess('')
//     if (!couponCode.trim()) {
//       setCouponError('Please enter a coupon code.')
//       return
//     }
//     const res = await validateCoupon(couponCode, subtotal)
//     if (!res.success) {
//       setCouponError(res.error || 'Invalid coupon code')
//       setActiveCoupon(null)
//     } else {
//       setActiveCoupon(res.coupon)
//       setCouponSuccess(`Coupon Applied! Discount: ${res.coupon.type === 'percentage' ? `${res.coupon.value}%` : `₹${res.coupon.value}`}`)
//     }
//   }

//   const handleRazorpayPayment = async (orderData: any, addressString: string) => {
//     const options = {
//       key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//       amount: orderData.amount,
//       currency: "INR",
//       name: SITE.name,
//       description: "Order Payment",
//       order_id: orderData.razorpayOrderId,
//       handler: async function (response: any) {
//         const verifyRes = await verifyRazorpayPayment(
//           response.razorpay_payment_id,
//           response.razorpay_order_id,
//           response.razorpay_signature,
//           orderData.orderId
//         )
//         if (verifyRes.success) {
//           setPlacedOrder({
//             order_number: orderData.orderNumber,
//             id: orderData.orderId,
//             total: grandTotal,
//             items: [...cart],
//             shippingAddress: addressString
//           })
//           clearCart()
//         } else {
//           showToast('Payment verification failed. Please contact support.', 'error')
//         }
//       },
//       prefill: {
//         name: profile.fullName,
//         contact: profile.phone,
//       },
//       // 2. ✅ UPDATED: Swapped Gulshan's Green out for Boujee Bazaar Luxury Gold theme tint options
//       theme: {
//         color: "#c5a880"
//       }
//     };
    
//     // @ts-ignore
//     const rzp1 = new window.Razorpay(options);
//     rzp1.on('payment.failed', function (response: any){
//       showToast("Payment failed! Reason: " + response.error.description, "error");
//     });
//     rzp1.open();
//   }

//   // Execute checkout and place order
//   const executeOrderPlacement = async () => {
//     const addressString = `${profile.street}, ${profile.city}, ${profile.state} - ${profile.zipCode}`
//     const method = paymentMethod === 'Online Payment (Razorpay)' ? 'RAZORPAY' : 'COD'
    
//     // Update local storage targets dynamically
//     localStorage.setItem('boujee-customer-profile', JSON.stringify(profile))
    
//     const res = await processCheckout(profile, cart, method)
//     if (!res.success) {
//       showToast(res.error || 'Failed to place order.', 'error')
//     } else {
//       if (res.isRazorpay) {
//         handleRazorpayPayment(res, addressString)
//       } else {
//         setPlacedOrder({
//           order_number: res.order_number,
//           id: res.orderId,
//           total: grandTotal,
//           items: [...cart],
//           shippingAddress: addressString
//         })
//         clearCart()
//       }
//     }
//   }

//   // Handle Checkout Submit
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (cart.length === 0) {
//       showToast('Your cart is empty', 'error')
//       return
//     }
//     if (!profile.fullName || !profile.email || !profile.phone || !profile.street || !profile.city || !profile.state || !profile.zipCode) {
//       showToast('Please fill out all shipping details.', 'error')
//       return
//     }
//     if (!isLoggedIn) {
//       if (!otpSent) {
//         setOtpPending(true)
//         startTransition(async () => {
//           const res = await sendEmailOtp(profile.email, 'REGISTER', profile.fullName)
//           setOtpPending(false)
//           if (res?.error) {
//             showToast(res.error, 'error')
//           } else {
//             setOtpSent(true)
//             showToast('Verification code sent to ' + profile.email, 'success')
//           }
//         })
//         return
//       } else {
//         if (!otpCode || otpCode.length !== 6) {
//           showToast('Please enter a valid 6-digit verification code.', 'error')
//           return
//         }
//         setOtpPending(true)
//                   // Continuation from page 9/26 of your PDF:
//         startTransition(async () => {
//           const res = await verifyEmailOtp(profile.email, otpCode, 'NO_REDIRECT', profile.fullName, profile.phone)
//           if (res?.error) {
//             setOtpPending(false)
//             setOtpError(res.error)
//             showToast(res.error, 'error')
//           } else if (res?.success) {
//             try {
//               window.dispatchEvent(new Event('boujee-login-status-change'))
//               await executeOrderPlacement()
//               setOtpSent(false)
//             } catch (e: any) {
//               showToast(e.message || 'Error processing checkout', 'error')
//             } finally {
//               setOtpPending(false)
//             }
//           } else {
//             setOtpPending(false)
//           }
//         })
//         return
//       }
//     }
//     startTransition(async () => {
//       await executeOrderPlacement()
//     })
//   }

//   // Format Whatsapp Link for Success Modal
//   const getWhatsappLink = () => {
//     if (!placedOrder) return ''
//     const itemsText = placedOrder.items.map((i: any) => `- ${i.name} (x${i.quantity})`).join('\n')
//     const message = `Hi The Boujee Bazaar!\n\nI just placed an order:\nOrder Number: *${placedOrder.order_number}*\nItems:\n${itemsText}\nTotal Amount: *₹${placedOrder.total.toLocaleString('en-IN')}*\nPayment Method: *${paymentMethod}*\n\nShipping Address:\n${placedOrder.shippingAddress}\n\nPlease confirm my order. Thank you!`
//     return `https://wa.me{SITE.whatsapp}?text=${encodeURIComponent(message)}`
//   }

//   if (placedOrder) {
//     return (
//       <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-neutral-100 shadow-xl text-center space-y-6 animate-fade-in mt-6">
//         <div className="w-16 h-16 bg-neutral-50 text-[#c5a880] border border-[#c5a880]/20 rounded-full flex items-center justify-center mx-auto">
//           <CheckCircle2 className="w-10 h-10" />
//         </div>
//         <div>
//           <h2 className="font-display font-bold text-2xl text-neutral-900" style={{ fontFamily: 'Playfair Display, serif' }}>Order Placed Successfully!</h2>
//           <p className="text-sm text-neutral-500 mt-1">Thank you for shopping with The Boujee Bazaar.</p>
//         </div>
//         <div className="p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100 text-left space-y-3">
//           <div className="flex justify-between text-xs">
//             <span className="text-neutral-400 uppercase font-semibold">Order Number</span>
//             <span className="font-bold text-neutral-900">{placedOrder.order_number}</span>
//           </div>
//           <div className="flex justify-between text-xs">
//             <span className="text-neutral-400 uppercase font-semibold">Grand Total</span>
//             <span className="font-bold text-neutral-900">₹{placedOrder.total.toLocaleString('en-IN')}</span>
//           </div>
//           <div className="flex justify-between text-xs">
//             <span className="text-neutral-400 uppercase font-semibold">Payment Method</span>
//             <span className="font-bold text-neutral-900">{paymentMethod}</span>
//           </div>
//         </div>
//         <div className="space-y-2">
//           <a
//             href={getWhatsappLink()}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-neutral-900 text-white font-body font-semibold rounded-full shadow-md hover:bg-neutral-800 transition-all"
//           >
//             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//               <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.49 4.975 1.491 5.474 0 9.932-4.457 9.935-9.931a9.885 9.885 0 0 0-2.883-7.054A9.882 9.882 0 0 0 11.758 1.15c-5.483 0-9.94 4.458-9.944 9.934-.002 1.936.507 3.82 1.476 5.489L2.247 20.89l4.4-.736z" />
//             </svg>
//             Confirm via WhatsApp
//           </a>
//           <a href="/" className="w-full inline-flex items-center justify-center py-3 text-sm text-neutral-500 hover:text-neutral-900 font-semibold transition-colors">
//             Return to Store
//           </a>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
//         <Script src="https://razorpay.com" strategy="lazyOnload" />
        
//         {/* Left Column: Shipping Address & Payment Form */}
//         <div className="lg:col-span-7 space-y-6">
//           <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-100 shadow-sm space-y-6">
//             <h2 className="text-base font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
//               <Truck className="w-5 h-5 text-[#c5a880]" /> Shipping Details
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Full Name</label>
//                 <input
//                   type="text"
//                   required
//                   maxLength={50}
//                   value={profile.fullName}
//                   onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
//                   placeholder="e.g. Sarah Jones"
//                   className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-sm"
//                 />
//               </div>
//               <div>
//                 <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email Address</label>
//                 <input
//                   type="email"
//                   required
//                   disabled={isLoggedIn}
//                   value={profile.email}
//                   onChange={(e) => setProfile({ ...profile, email: e.target.value })}
//                   placeholder="e.g. sarah@example.com"
//                   className={`w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm transition-all focus:outline-none ${
//                     isLoggedIn
//                       ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed border-neutral-100'
//                       : 'bg-white text-neutral-900 focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880]'
//                   }`}
//                 />
//               </div>
//               <div>
//                 <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Phone Number</label>
//                 <input
//                   type="text"
//                   required
//                   maxLength={10}
//                   pattern="\d{10}"
//                   title="Please enter exactly 10 digits"
//                   value={profile.phone}
//                   onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, '') })}
//                   placeholder="e.g. 9876543210"
//                   className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-sm"
//                 />
//               </div>
//               <div>
//                 <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Alternate Phone <span className="text-neutral-300 normal-case font-medium">(Optional)</span></label>
//                 <input
//                   type="text"
//                   maxLength={10}
//                   pattern="\d{10}"
//                   title="Please enter exactly 10 digits"
//                   value={profile.alternatePhone}
//                   onChange={(e) => setProfile({ ...profile, alternatePhone: e.target.value.replace(/\D/g, '') })}
//                   placeholder="e.g. 9876543210"
//                   className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-sm"
//                 />
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Street Address</label>
//                 <input
//                   type="text"
//                   required
//                   maxLength={150}
//                   value={profile.street}
//                   onChange={(e) => setProfile({ ...profile, street: e.target.value })}
//                   placeholder="e.g. Flat number, building, street name"
//                   className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-sm"
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">City</label>
//                   <input
//                     type="text"
//                     required
//                     maxLength={50}
//                     value={profile.city}
//                     onChange={(e) => setProfile({ ...profile, city: e.target.value })}
//                     placeholder="e.g. Mumbai"
//                     className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-sm"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">State</label>
//                   <input
//                     type="text"
//                     required
//                     maxLength={50}
//                     value={profile.state}
//                     onChange={(e) => setProfile({ ...profile, state: e.target.value })}
//                     placeholder="e.g. Maharashtra"
//                     className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-sm"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">ZIP / PIN Code</label>
//                 <input
//                   type="text"
//                   required
//                   maxLength={6}
//                   pattern="\d{6}"
//                   title="Please enter a valid 6-digit PIN code"
//                   value={profile.zipCode}
//                   onChange={(e) => setProfile({ ...profile, zipCode: e.target.value.replace(/\D/g, '') })}
//                   placeholder="e.g. 400001"
//                   className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-sm"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Payment Method Selector */}
//           <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-100 shadow-sm space-y-6">
//             <h2 className="text-base font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
//               <CreditCard className="w-5 h-5 text-[#c5a880]" /> Payment Option
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
//                 paymentMethod === 'Cash on Delivery'
//                   ? 'border-neutral-900 bg-neutral-50/50'
//                   : 'border-neutral-100 bg-white hover:border-neutral-200'
//               }`}>
//                 <input type="radio" name="payment" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} className="sr-only" />
//                 <span className="font-bold text-neutral-900 text-sm">Cash on Delivery (+₹{shipping.cod_charge ?? 50})</span>
//                 <span className="text-xs text-neutral-400 mt-1 leading-relaxed">Pay COD charge & product value at your doorstep.</span>
//               </label>
//               <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
//                 paymentMethod === 'Online Payment (Razorpay)'
//                   ? 'border-neutral-900 bg-neutral-50/50'
//                   : 'border-neutral-100 bg-white hover:border-neutral-200'
//               }`}>
//                 <input type="radio" name="payment" checked={paymentMethod === 'Online Payment (Razorpay)'} onChange={() => setPaymentMethod('Online Payment (Razorpay)')} className="sr-only" />
//                 <span className="font-bold text-neutral-900 text-sm border-none">
//                   Online Payment {shipping.online_discount ? `(${shipping.online_discount}% Off)` : ''}
//                 </span>
//                 <span className="text-xs text-neutral-400 mt-1 leading-relaxed">Pay securely via UPI, Cards, or Netbanking.</span>
//               </label>
//             </div>
//           </div>
//         </div>

//         {/* Right Column: Order Summary & Coupon Codes (Sticky) */}
//         <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28 lg:self-start">
//           <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-6">
//             <h2 className="text-base font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
//               <ShoppingBag className="w-5 h-5 text-[#c5a880]" /> Order Summary
//             </h2>
//             <div className="divide-y divide-neutral-50 max-h-80 overflow-y-auto pr-1">
//               {cart.length === 0 ? (
//                 <p className="text-sm text-neutral-400 py-4">Your cart is empty.</p>
//               ) : (
//                 cart.map((item) => (
//                   <div key={item.cartItemId} className="flex gap-4 py-4 items-start">
//                     <Link href={`/shop/${item.id}`} className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border border-neutral-100 hover:opacity-90 transition-all">
//                       <Image src={item.image || item.image_url || '/assets/img/placeholder.jpeg'} alt={item.name} fill className="object-cover" />
//                     </Link>
//                     <div className="flex-1 min-w-0 space-y-2">
//                       <div className="flex items-start justify-between gap-2">
//                         <Link href={`/shop/${item.id}`} className="hover:text-neutral-600 transition-colors">
//                           <h4 className="font-semibold text-neutral-800 text-sm leading-snug line-clamp-2">{item.name}</h4>
//                         </Link>
//                         <span className="font-bold text-neutral-900 text-sm shrink-0">
//                           ₹{(item.price * item.quantity).toLocaleString('en-IN')}
//                         </span>
//                       </div>
//                       <p className="text-xs text-neutral-400">
//                         {item.variant_name ? `${item.variant_name} • ` : ''}₹{item.price} each
//                       </p>
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center border border-neutral-100 rounded-full p-0.5 bg-neutral-50">
//                           <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="p-1 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-white transition-colors">
//                             <Minus className="w-3.5 h-3.5" />
//                           </button>
//                           <span className="px-3 text-sm font-semibold text-neutral-800">{item.quantity}</span>
//                           <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="p-1 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-white transition-colors">
//                             <Plus className="w-3.5 h-3.5" />
//                           </button>
//                         </div>
//                         <button type="button" onClick={() => removeFromCart(item.cartItemId)} className="text-neutral-300 hover:text-red-500 transition-colors">
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>

//             {/* Calculations Breakdown */}
//             <div className="border-t border-neutral-100 pt-4 space-y-2.5">
//               <div className="flex justify-between text-xs text-neutral-500">
//                 <span>Subtotal</span>
//                 <span className="font-bold text-neutral-800">₹{subtotal.toLocaleString('en-IN')}</span>
//               </div>
//               <div className="flex justify-between text-xs text-neutral-500">
//                 <span>Shipping Fee</span>
//                 <span className="font-bold text-neutral-800">
//                   {shippingFee === 0 ? <span className="text-[#c5a880] font-bold uppercase">Free</span> : `₹${shippingFee}`}
//                 </span>
//               </div>
//               {paymentMethod === 'Cash on Delivery' && (
//                 <div className="flex justify-between text-xs text-neutral-500">
//                   <span>COD Collection Fee</span>
//                   <span className="font-bold text-neutral-800">₹{codFee}</span>
//                 </div>
//               )}
//               {onlineDiscountAmount > 0 && (
//                 <div className="flex justify-between text-xs text-[#c5a880] font-semibold">
//                   <span>Online Discount ({onlineDiscountPercent}%)</span>
//                   <span>-₹{onlineDiscountAmount.toLocaleString('en-IN')}</span>
//                 </div>
//               )}
//               {discount > 0 && (
//                 <div className="flex justify-between text-xs text-green-600 font-medium">
//                   <span>Coupon Discount ({activeCoupon?.code})</span>
//                   <span className="font-bold">-₹{discount.toLocaleString('en-IN')}</span>
//                 </div>
//               )}
//               <div className="flex justify-between text-sm border-t border-neutral-100 pt-3.5">
//                 <span className="font-bold text-neutral-900">Grand Total</span>
//                 <span className="font-bold text-lg text-neutral-900">₹{grandTotal.toLocaleString('en-IN')}</span>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={pending || otpPending}
//               className="w-full py-3.5 px-6 bg-neutral-900 text-white font-semibold rounded-full shadow-md hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//             >
//               {pending || otpPending ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 <>
//                   <ShoppingBag className="w-4.5 h-4.5" />
//                   {isLoggedIn
//                     ? `Place Order • ₹${grandTotal.toLocaleString('en-IN')}`
//                     : (otpSent ? 'Confirm OTP & Place Order' : 'Verify Email & Place Order')}
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Coupons Form Card */}
//                     {/* Coupons Form Card */}
//           <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-4">
//             <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5" style={{ fontFamily: 'Playfair Display, serif' }}>
//               <Tag className="w-4 h-4 text-[#c5a880]" /> Have a Coupon?
//             </h3>
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={couponCode}
//                 onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
//                 onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
//                 placeholder="e.g. WELCOME100"
//                 className="flex-1 px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-xs uppercase focus:outline-none"
//               />
//               <button type="button" onClick={handleApplyCoupon} className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all">
//                 Apply
//               </button>
//             </div>
//             {couponError && <p className="text-xs text-red-500">{couponError}</p>}
//             {couponSuccess && <p className="text-xs text-green-600 font-semibold">{couponSuccess}</p>}
//             <div className="text-[11px] text-neutral-400 border-t border-neutral-50 pt-2.5 space-y-1">
//               <p><strong>WELCOME100</strong> — Flat ₹100 discount on orders above ₹499</p>
//             </div>
//           </div>
//         </div>
//       </form>

//       {/* Guest OTP Modal Overlay */}
//       {!isLoggedIn && otpSent && (
//         <div className="fixed inset-0 z- flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
//           <div className="bg-white max-w-md w-full rounded-2xl p-6 sm:p-8 border border-neutral-100 shadow-2xl text-center space-y-6 relative max-h-[90vh]">
//             <button type="button" onClick={() => setOtpSent(false)} className="absolute right-4 top-4 p-1.5 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-50 transition-all">
//               <X className="w-4 h-4" />
//             </button>
//             <div className="w-12 h-12 bg-neutral-50 text-[#c5a880] border border-[#c5a880]/20 rounded-full flex items-center justify-center mx-auto shadow-sm">
//               <Lock className="w-5 h-5" />
//             </div>
//             <div>
//               <h3 className="text-xl font-bold text-neutral-900" style={{ fontFamily: 'Playfair Display, serif' }}>Confirm Verification Code</h3>
//               <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
//                 We sent a 6-digit OTP code to <strong className="text-neutral-900 font-semibold">{profile.email}</strong>. Please enter it below to verify your account and complete your order.
//               </p>
//             </div>
//             <div className="space-y-4">
//               <input
//                 type="text"
//                 required
//                 maxLength={6}
//                 value={otpCode}
//                 onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
//                 placeholder="123456"
//                 className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-center tracking-[0.5em] font-bold text-xl text-neutral-900 focus:outline-none shadow-inner"
//               />
//               {otpError && <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100 font-medium">{otpError}</div>}
//               <div className="text-xs text-center text-neutral-400">
//                 {resendTimer > 0 ? (
//                   <span>Resend code in <strong className="text-neutral-900 font-bold">{resendTimer}s</strong></span>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={async () => {
//                       setOtpPending(true)
//                       const res = await sendEmailOtp(profile.email, 'REGISTER', profile.fullName)
//                       setOtpPending(false)
//                       if (res?.error) { showToast(res.error, 'error') } else { setResendTimer(60); showToast('Verification code resent successfully.', 'success'); }
//                     }}
//                     className="text-[#c5a880] font-semibold hover:underline"
//                   >
//                     Resend Verification Code
//                   </button>
//                 )}
//               </div>
//               <div className="flex gap-3 pt-2">
//                 <button type="button" onClick={() => setOtpSent(false)} className="flex-1 py-2 px-4 bg-white border border-neutral-200 text-neutral-600 rounded-xl font-medium hover:bg-neutral-50 text-sm transition-all">
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   disabled={otpPending || otpCode.length !== 6}
//                   onClick={() => {
//                     setOtpPending(true)
//                     startTransition(async () => {
//                       const res = await verifyEmailOtp(profile.email, otpCode, 'NO_REDIRECT', profile.fullName, profile.phone)
//                       if (res?.error) {
//                         setOtpPending(false); setOtpError(res.error); showToast(res.error, 'error');
//                       } else if (res?.success) {
//                         try {
//                           window.dispatchEvent(new Event('boujee-login-status-change'))
//                           await executeOrderPlacement()
//                           setOtpSent(false)
//                         } catch (e: any) { showToast(e.message || 'Error processing checkout', 'error') } finally { setOtpPending(false) }
//                       } else { setOtpPending(false) }
//                     })
//                   }}
//                   className="flex-1 py-2 px-4 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 text-sm flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
//                 >
//                   {otpPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Order'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }
'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { validateCoupon } from '@/actions/admin/coupons'
import { processCheckout, verifyRazorpayPayment, cancelPendingOrder, checkPaymentStatus } from '@/actions/checkout'
import { SITE } from '@/lib/data'
import { Truck, Tag, CreditCard, ShoppingBag, CheckCircle2, Lock, Plus, Minus, X, Loader2, Clock, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type ShippingSettings = {
  flat_rate: number
  free_threshold: number
  cod_charge?: number
  online_discount?: number
}

const PENDING_RAZORPAY_ORDER_KEY = 'boujee-pending-razorpay-order'

export default function CheckoutForm({ shipping, isLoggedIn }: { shipping: ShippingSettings, isLoggedIn: boolean }) {
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart()
  const { showToast } = useToast()
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  // Shipping Address Form State
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  })

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [activeCoupon, setActiveCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')

  const enableCod = (shipping as any)?.enable_cod !== false
  const enableOnline = (shipping as any)?.enable_online !== false

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Online Payment (Razorpay)'>(() => {
    if (!enableCod && enableOnline) return 'Online Payment (Razorpay)'
    return 'Cash on Delivery'
  })

  useEffect(() => {
    if (!enableCod && enableOnline && paymentMethod !== 'Online Payment (Razorpay)') {
      setPaymentMethod('Online Payment (Razorpay)')
    } else if (!enableOnline && enableCod && paymentMethod !== 'Cash on Delivery') {
      setPaymentMethod('Cash on Delivery')
    }
  }, [enableCod, enableOnline, paymentMethod])

  // Success Modal State
  const [placedOrder, setPlacedOrder] = useState<any>(null)

  // Pending / Recovery State
  const [pendingOrder, setPendingOrder] = useState<any>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [pendingFailed, setPendingFailed] = useState(false)
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false)

  // On mobile, UPI intent apps (PhonePe/GPay) hand off to a native app and back —
  // Android frequently backgrounds/reloads the browser tab during that handoff,
  // which wipes this component's in-memory state before the Razorpay `handler`
  // callback (or `ondismiss`) ever fires. Persisting the pending order reference
  // lets us recover it on the next mount/tab-focus instead of showing nothing.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(PENDING_RAZORPAY_ORDER_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (parsed?.orderId) {
        recoverPendingOrder(parsed)
      }
    } catch (e) {
      console.error(e)
      localStorage.removeItem(PENDING_RAZORPAY_ORDER_KEY)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-check whenever the tab regains focus (covers the case where the tab
  // survived the app-switch but the Razorpay callback still never fired).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      const raw = localStorage.getItem(PENDING_RAZORPAY_ORDER_KEY)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (parsed?.orderId) recoverPendingOrder(parsed)
      } catch (e) {
        console.error(e)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 1. Prefill from local storage and cookie state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let parsed: any = null;

      // Try checking cookie state first
      const value = `; ${document.cookie}`;
      const parts = value.split(`; boujee-customer-profile-token=`);
      if (parts.length === 2) {
        const val = parts.pop()?.split(';').shift();
        if (val) {
          try {
            parsed = JSON.parse(decodeURIComponent(val));
          } catch (e) {
            console.warn("Failed parsing profile cookie", e);
          }
        }
      }

      // Try local storage if cookie was not found/parsed
      if (!parsed) {
        const savedData = localStorage.getItem('boujee-customer-profile') || localStorage.getItem('gulshan-customer-profile');
        if (savedData) {
          try {
            parsed = JSON.parse(savedData);
          } catch (e) {
            console.error("Failed parsing profile local storage", e);
          }
        }
      }

      if (parsed) {
        setProfile(prev => ({
          ...prev,
          fullName: parsed.fullName || parsed.full_name || '',
          email: parsed.email || prev.email,
          phone: parsed.phone || '',
          alternatePhone: parsed.alternatePhone || '',
          street: parsed.street || parsed.address_line_1 || '',
          city: parsed.city || '',
          state: parsed.state || '',
          zipCode: parsed.zipCode || parsed.postal_code || '',
        }));
      }
    }
  }, []);

  // Load user profile and default address from database if logged in
  useEffect(() => {
    if (isLoggedIn) {
      const supabase = createClient()
      if (supabase) {
        supabase.auth.getUser().then(({ data }) => {
          if (data?.user) {
            Promise.all([
              supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle(),
              supabase.from('addresses').select('*').eq('user_id', data.user.id).order('is_default', { ascending: false }).limit(1).maybeSingle(),
              supabase.from('orders').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
            ]).then(([profRes, addrRes, orderRes]) => {
              const profileData = profRes.data
              const addressData = addrRes.data
              const lastOrder = orderRes.data
              
              setProfile(prev => ({
                ...prev,
                fullName: profileData?.full_name || lastOrder?.customer_name || prev.fullName,
                email: data.user.email || prev.email,
                phone: addressData?.phone || profileData?.phone || lastOrder?.customer_phone || prev.phone,
                alternatePhone: addressData?.alternate_phone || prev.alternatePhone,
                street: addressData?.address_line_1 || lastOrder?.shipping_street || prev.street,
                city: addressData?.city || lastOrder?.shipping_city || prev.city,
                state: addressData?.state || lastOrder?.shipping_state || prev.state,
                zipCode: addressData?.postal_code || lastOrder?.shipping_pincode || prev.zipCode,
              }))
            })
          }
        }).catch((err) => console.error('Failed to load profile in checkout:', err))
      }
    }
  }, [isLoggedIn])

  // Calculations Breakdown
  const subtotal = cartTotal
  const shippingFee = subtotal >= (shipping.free_threshold ?? 1499) ? 0 : (shipping.flat_rate ?? 99)
  const codFee = paymentMethod === 'Cash on Delivery' ? (shipping.cod_charge ?? 50) : 0
  
  let discount = 0
  if (activeCoupon) {
    if (activeCoupon.type === 'percentage') {
      discount = Math.round((subtotal * activeCoupon.value) / 100)
    } else {
      discount = activeCoupon.value
    }
  }

  const onlineDiscountPercent = shipping.online_discount ?? 0
  const onlineDiscountAmount = paymentMethod === 'Online Payment (Razorpay)'
    ? Math.round((subtotal * onlineDiscountPercent) / 100)
    : 0

  const grandTotal = Math.max(0, subtotal + shippingFee + codFee - discount - onlineDiscountAmount)

  // Handle Coupon Apply
  const handleApplyCoupon = async () => {
    setCouponError('')
    setCouponSuccess('')
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.')
      return
    }
    const res = await validateCoupon(couponCode, subtotal)
    if (!res.success) {
      setCouponError(res.error || 'Invalid coupon code')
      setActiveCoupon(null)
    } else {
      setActiveCoupon(res.coupon)
      setCouponSuccess(`Coupon Applied! Discount: ${res.coupon.type === 'percentage' ? `${res.coupon.value}%` : `₹${res.coupon.value}`}`)
    }
  }

  const handleRazorpayPayment = async (orderData: any, addressString: string) => {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

    if (!keyId || !keyId.trim()) {
      showToast('Razorpay Key ID missing! Please add NEXT_PUBLIC_RAZORPAY_KEY_ID to your .env file.', 'error')
      return
    }

    // Function to initialize and open Razorpay popup
    const openModal = () => {
      try {
        // Persist the pending order reference BEFORE handing off to the
        // gateway. UPI intent apps (PhonePe/GPay) redirect the user away
        // from the browser; on return the tab may have been backgrounded or
        // reloaded by the OS, wiping this component's state before the
        // `handler`/`ondismiss` callbacks below ever get a chance to run.
        // Without this, the customer just sees an empty checkout page with
        // no sign the order (or payment) exists.
        localStorage.setItem(PENDING_RAZORPAY_ORDER_KEY, JSON.stringify({
          ...orderData,
          shippingAddress: addressString,
          total: grandTotal,
          items: [...cart],
        }))

        const options = {
          key: keyId,
          amount: orderData.amount,
          currency: "INR",
          name: SITE.name,
          description: "Order Payment",
          order_id: orderData.razorpayOrderId,
          // Without a timeout, a UPI intent that never resolves (app didn't
          // open, bank never responded) leaves the "Processing your payment"
          // screen spinning forever with only Razorpay's own manual Cancel
          // as an escape. This auto-dismisses after 5 minutes so `ondismiss`
          // below fires and drops the user into our pending/retry recovery
          // screen instead of a dead end.
          timeout: 300,
          modal: {
            ondismiss: function () {
              setPendingOrder({
                ...orderData,
                shippingAddress: addressString,
                total: grandTotal,
                items: [...cart],
              })
              showToast('Payment not completed. Your order is saved as pending — you can check its status or retry.', 'info')
            }
          },
          handler: async function (response: any) {
            if (isProcessingSuccess) return
            setIsProcessingSuccess(true)
            localStorage.removeItem(PENDING_RAZORPAY_ORDER_KEY)
            const verifyRes = await verifyRazorpayPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              orderData.orderId
            )
            if (verifyRes.success) {
              clearCart()
              router.push(`/checkout/success?orderId=${encodeURIComponent(orderData.orderId)}`)
            } else {
              setIsProcessingSuccess(false)
              showToast('Payment verification failed. Please contact support.', 'error')
            }
          },
          prefill: {
            name: profile.fullName,
            contact: profile.phone,
            email: profile.email
          },
          theme: {
            color: "#c5a880"
          }
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any){
          setPendingOrder({
            ...orderData,
            shippingAddress: addressString,
            total: grandTotal,
            items: [...cart],
          })
          setPendingFailed(true)
          showToast("Payment failed! Reason: " + (response.error?.description || 'Transaction failed'), "error");
        });
        rzp1.open();
      } catch (err: any) {
        console.error('Failed to open Razorpay modal:', err)
        showToast('Error opening Razorpay gateway: ' + (err?.message || 'Check browser console'), 'error')
      }
    }

    // Dynamic SDK loading fallback if script is not yet loaded on window
    if (typeof (window as any).Razorpay === 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => openModal()
      script.onerror = () => showToast('Failed to load Razorpay SDK. Please check your network connection.', 'error')
      document.body.appendChild(script)
    } else {
      openModal()
    }
  }

  // Execute checkout and place order
  const executeOrderPlacement = async () => {
    const addressString = `${profile.street}, ${profile.city}, ${profile.state} - ${profile.zipCode}`
    const method = paymentMethod === 'Online Payment (Razorpay)' ? 'RAZORPAY' : 'COD'
    
    localStorage.setItem('boujee-customer-profile', JSON.stringify(profile))
    
    const res = await processCheckout(profile, cart, method, activeCoupon?.code)
    if (!res.success) {
      showToast(res.error || 'Failed to place order.', 'error')
    } else {
      if (res.isRazorpay) {
        handleRazorpayPayment(res, addressString)
      } else {
        clearCart()
        router.push(`/checkout/success?orderId=${encodeURIComponent(res.orderId)}`)
      }
    }
  }

  // Shared by the mount/tab-focus recovery effects above and the manual
  // "Check Payment Status" button. `silent` suppresses toasts for the
  // automatic background checks so we don't spam the user on every tab focus.
  const recoverPendingOrder = async (parsed: any, opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? true
    if (!silent) setCheckingStatus(true)
    const res = await checkPaymentStatus(parsed.orderId)
    if (!silent) setCheckingStatus(false)

    if (!res.found) {
      localStorage.removeItem(PENDING_RAZORPAY_ORDER_KEY)
      if (!silent) showToast(res.error || 'Order not found. It may have been removed.', 'error')
      return
    }

    if (res.payment_status === 'paid' || res.status === 'confirmed') {
      if (isProcessingSuccess) return
      setIsProcessingSuccess(true)
      localStorage.removeItem(PENDING_RAZORPAY_ORDER_KEY)
      setPendingOrder(null)
      setPendingFailed(false)
      clearCart()
      router.push(`/checkout/success?orderId=${encodeURIComponent(res.orderId)}`)
    } else if (res.payment_status === 'failed') {
      setPendingOrder(parsed)
      setPendingFailed(true)
      if (!silent) showToast('This payment was marked failed by the gateway. You can retry or contact support.', 'error')
    } else {
      setPendingOrder(parsed)
      setPendingFailed(false)
      if (!silent) showToast('Your payment is still pending with the gateway. You can retry now.', 'info')
    }
  }

  const handleCheckPaymentStatus = async () => {
    if (!pendingOrder) return
    await recoverPendingOrder(pendingOrder, { silent: false })
  }

  const handleRetryPayment = async () => {
    if (!pendingOrder) return
    setPendingFailed(false)
    await handleRazorpayPayment(pendingOrder, pendingOrder.shippingAddress || '')
  }

  const handleCancelPendingOrder = async () => {
    if (!pendingOrder) return
    await cancelPendingOrder(pendingOrder.orderId)
    localStorage.removeItem(PENDING_RAZORPAY_ORDER_KEY)
    setPendingOrder(null)
    setPendingFailed(false)
    showToast('Your pending order has been cancelled.', 'success')
  }

  // Handle Checkout Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error')
      return
    }
    if (!profile.fullName || !profile.email || !profile.phone || !profile.street || !profile.city || !profile.state || !profile.zipCode) {
      showToast('Please fill out all shipping details.', 'error')
      return
    }

    // ✅ FIXED GUEST ACCESS: Stops unauthorized guests and cleanly maps them onto the password screen
    if (!isLoggedIn) {
      showToast('Authentication required. Redirecting to password login page...', 'success')
      localStorage.setItem('boujee-customer-profile', JSON.stringify(profile))
      setTimeout(() => {
        router.push(`/login?redirect=/checkout`)
      }, 1500)
      return
    }

    startTransition(async () => {
      await executeOrderPlacement()
    })
  }

  const getWhatsappLink = () => {
    if (!placedOrder) return ''
    const orderRef = placedOrder.order_number || `#${String(placedOrder.id).substring(0, 8).toUpperCase()}`
    const itemsText = placedOrder.items.map((i: any) => `- ${i.name} (x${i.quantity})`).join('\n')
    const message = `Hi The Boujee Bazaar!\n\nI just placed an order:\nOrder Number: *${orderRef}*\nItems:\n${itemsText}\nTotal Amount: *₹${placedOrder.total.toLocaleString('en-IN')}*\nPayment Method: *${paymentMethod}*\n\nShipping Address:\n${placedOrder.shippingAddress}\n\nPlease confirm my order. Thank you!`
    return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`
  }



  if (pendingOrder) {
    const pendingRef = pendingOrder.orderNumber || pendingOrder.orderId
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-neutral-100 shadow-xl text-center space-y-6 animate-fade-in mt-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="w-16 h-16 bg-amber-50 text-[#c5a880] border border-[#c5a880]/20 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-9 h-9" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-neutral-900" style={{ fontFamily: 'Playfair Display, serif' }}>Payment Not Completed</h2>
          <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
            Your order has been saved as pending. No money will be charged unless the payment actually goes through.
          </p>
        </div>
        <div className="p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100 text-left space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400 uppercase font-semibold">Order Number</span>
            <span className="font-mono font-bold text-neutral-900">{pendingRef}</span>
          </div>
          {pendingFailed && (
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100 font-medium">
              Your payment was declined. Please retry or contact support.
            </div>
          )}
        </div>
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleCheckPaymentStatus}
            disabled={checkingStatus}
            className="w-full py-3 px-4 bg-neutral-900 text-white font-semibold rounded-full shadow-md hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {checkingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Check Payment Status
          </button>
          <button
            type="button"
            onClick={handleRetryPayment}
            className="w-full py-3 px-4 bg-[#c5a880] text-white font-semibold rounded-full shadow-md hover:opacity-90 transition-all text-sm"
          >
            Retry Payment
          </button>
          <button
            type="button"
            onClick={handleCancelPendingOrder}
            className="w-full py-3 px-4 bg-white border border-neutral-200 text-neutral-600 font-semibold rounded-full hover:bg-neutral-50 transition-all text-sm"
          >
            Cancel Pending Order
          </button>
          <a
            href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hi The Boujee Bazaar! I need help with my order ${pendingRef}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-4 bg-neutral-50 text-neutral-700 font-semibold rounded-full hover:bg-neutral-100 transition-all text-sm"
          >
            Contact Support
          </a>
          <Link href="/" className="block w-full py-3 text-sm text-neutral-500 hover:text-neutral-900 font-semibold transition-colors">
            Return to Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        
        {/* Left Column: Shipping Address & Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-100 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              <Truck className="w-5 h-5 text-[#c5a880]" /> Shipping Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="e.g. Sarah Jones"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  disabled={isLoggedIn}
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="e.g. sarah@example.com"
                  className={`w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium transition-all focus:outline-none ${
                    isLoggedIn
                      ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed border-neutral-100'
                      : 'bg-white text-neutral-900 focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880]'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  pattern="\d{10}"
                  title="Please enter exactly 10 digits"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Alternate Phone <span className="text-neutral-300 normal-case font-medium">(Optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  pattern="\d{10}"
                  title="Please enter exactly 10 digits"
                  value={profile.alternatePhone}
                  onChange={(e) => setProfile({ ...profile, alternatePhone: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-xs font-medium"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Street Address</label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={profile.street}
                  onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                  placeholder="e.g. Flat number, building, street name"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">City</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">State</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-xs font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">ZIP / PIN Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  title="Please enter a valid 6-digit PIN code"
                  value={profile.zipCode}
                  onChange={(e) => setProfile({ ...profile, zipCode: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 400001"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/20 focus:border-[#c5a880] transition-all text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-100 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              <CreditCard className="w-5 h-5 text-[#c5a880]" /> Payment Option
            </h2>
            <div className={`grid grid-cols-1 ${enableCod && enableOnline ? 'md:grid-cols-2' : ''} gap-4`}>
              {enableCod && (
                <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'Cash on Delivery' ? 'border-neutral-900 bg-neutral-50/50' : 'border-neutral-100 bg-white hover:border-neutral-200'
                }`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} className="sr-only" />
                  <span className="font-bold text-neutral-900 text-xs uppercase tracking-wide">Cash on Delivery (+₹{shipping.cod_charge ?? 50})</span>
                  <span className="text-xs text-neutral-400 mt-1 leading-relaxed">Pay COD charge & product value at your doorstep.</span>
                </label>
              )}
              {enableOnline && (
                <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'Online Payment (Razorpay)' ? 'border-neutral-900 bg-neutral-50/50' : 'border-neutral-100 bg-white hover:border-neutral-200'
                }`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'Online Payment (Razorpay)'} onChange={() => setPaymentMethod('Online Payment (Razorpay)')} className="sr-only" />
                  <span className="font-bold text-neutral-900 text-xs uppercase tracking-wide">
                    Online Payment {shipping.online_discount ? `(${shipping.online_discount}% Off)` : ''}
                  </span>
                  <span className="text-xs text-neutral-400 mt-1 leading-relaxed">Pay securely via UPI, Cards, or Netbanking.</span>
                </label>
              )}
              {!enableCod && !enableOnline && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold">
                  No payment options are currently active. Please contact support.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon Codes (Sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              <ShoppingBag className="w-5 h-5 text-[#c5a880]" /> Order Summary
            </h2>
            <div className="divide-y divide-neutral-50 max-h-80 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 py-4 items-start">
                    <Link href={`/shop/${item.id}`} className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border border-neutral-100 hover:opacity-90 transition-all">
                      <Image src={item.image || item.image_url || '/assets/img/placeholder.jpeg'} alt={item.name} fill className="object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/shop/${item.id}`} className="hover:text-neutral-600 transition-colors">
                          <h4 className="font-semibold text-neutral-800 text-xs leading-snug line-clamp-2">{item.name}</h4>
                        </Link>
                        <span className="font-bold text-neutral-900 text-xs shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                        {item.variant_name && (
                          <span className="inline-flex items-center gap-1">
                            {item.variant_color_hex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: item.variant_color_hex }}
                              />
                            )}
                            {item.variant_name} •
                          </span>
                        )}
                        ₹{item.price} each
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-neutral-100 rounded-full p-0.5 bg-neutral-50">
                          <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="p-1 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-white transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-neutral-800">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="p-1 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-white transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button type="button" onClick={() => removeFromCart(item.cartItemId)} className="text-neutral-300 hover:text-red-500 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-neutral-100 pt-4 space-y-2.5">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Subtotal</span>
                <span className="font-bold text-neutral-800">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Shipping Fee</span>
                <span className="font-bold text-neutral-800">
                  {shippingFee === 0 ? <span className="text-[#c5a880] font-bold uppercase">Free</span> : `₹${shippingFee}`}
                </span>
              </div>
              {paymentMethod === 'Cash on Delivery' && (
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>COD Collection Fee</span>
                  <span className="font-bold text-neutral-800">₹{codFee}</span>
                </div>
              )}
              {onlineDiscountAmount > 0 && (
                <div className="flex justify-between text-xs text-[#c5a880] font-semibold">
                  <span>Online Discount ({onlineDiscountPercent}%)</span>
                  <span>-₹{onlineDiscountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-xs text-green-600 font-medium">
                  <span>Coupon Discount ({activeCoupon?.code})</span>
                  <span className="font-bold">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs border-t border-neutral-100 pt-3.5">
                <span className="font-bold text-neutral-900 text-sm">Grand Total</span>
                <span className="font-bold text-base text-neutral-900">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 px-6 bg-neutral-900 text-white font-semibold rounded-full shadow-md hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs uppercase tracking-wider"
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  {isLoggedIn ? `Place Order • ₹${grandTotal.toLocaleString('en-IN')}` : 'Login to Complete Purchase'}
                </>
              )}
            </button>
          </div>

          {/* Coupons Form Card */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5" style={{ fontFamily: 'Playfair Display, serif' }}>
              <Tag className="w-4 h-4 text-[#c5a880]" /> Have a Coupon?
            </h3>
            <div className="flex flex-col xs:flex-row gap-2">
  <input
    type="text"
    value={couponCode}
    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleApplyCoupon();
      }
    }}
    placeholder="e.g. WELCOME100"
    className="flex-1 min-w-0 px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-xs uppercase focus:outline-none font-semibold placeholder:normal-case placeholder:font-normal"
  />

  <button
    type="button"
    onClick={handleApplyCoupon}
    className="w-full xs:w-auto px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap"
  >
    Apply
  </button>
</div>
            {couponError && <p className="text-xs text-red-500 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-xs text-green-600 font-semibold">{couponSuccess}</p>}
          </div>
        </div>
      </form>
    </>
  )
}