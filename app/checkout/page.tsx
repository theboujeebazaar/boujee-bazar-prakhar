// import { getShippingSettings } from '@/actions/admin/shipping'
// import Header from '@/components/Header'
// import Footer from '@/components/Footer'
// import CheckoutForm from './_components/CheckoutForm'
// import { createClient } from '@/lib/supabase/server'

// export const metadata = {
//   title: 'Secure Checkout | Gulshan Modest',
// }

// export default async function CheckoutPage() {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()

//   const shipping = await getShippingSettings()

//   return (
//     <>
//       <Header />
//       <main className="min-h-screen bg-cream pt-28 pb-16 md:pt-36 md:pb-24">
//         <div className="max-w-wrap mx-auto px-5 md:px-8">
//           <CheckoutForm shipping={shipping} isLoggedIn={!!user} />
//         </div>
//       </main>
//       <Footer />
//     </>
//   )
// }
import { getShippingSettings } from '@/actions/admin/shipping'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CheckoutForm from './_components/CheckoutForm'
import { createClient } from '@/lib/supabase/server'
import { ToastProvider } from '@/context/ToastContext'
import { CartProvider } from '@/context/CartContext'

export const metadata = {
  title: 'Secure Checkout | The Boujee Bazaar',
  description: 'Complete your premium minimalist & luxury jewelry purchase securely.',
}

export default async function CheckoutPage() {
  const supabase = await createClient()
  
  // Safe user session fetching check using try/catch
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch (error) {
    console.warn("Checkout session evaluation handled smoothly.")
  }

  const shipping = await getShippingSettings()

  return (
    <ToastProvider>
      <CartProvider>
        <Header />
        
        {/* Strip out 'bg-cream' to align with the luxury brand guidelines */}
        <main className="min-h-screen bg-white pt-28 pb-16 md:pt-36 md:pb-24" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
              Secure Checkout
            </h1>
            
            {/* Renders your original form logic cleanly inside the active context providers */}
            <CheckoutForm shipping={shipping} isLoggedIn={!!user} />
          </div>
        </main>

        <Footer />
      </CartProvider>
    </ToastProvider>
  )
}
