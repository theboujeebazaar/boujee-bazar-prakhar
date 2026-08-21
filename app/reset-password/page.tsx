import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ResetPasswordForm from './_components/ResetPasswordForm'
import { ToastProvider } from '@/context/ToastContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { CartProvider } from '@/context/CartContext'

export const metadata = {
  title: 'Reset Password | The Boujee Bazaar',
  description: 'Choose a new password for your The Boujee Bazaar account.',
}

export default function ResetPasswordPage() {
  return (
    <ToastProvider>
      <WishlistProvider>
        <CartProvider>
          <Header />
          <main className="min-h-screen bg-cream flex flex-col justify-center pt-36 pb-20 px-5">
            <div className="max-w-md w-full mx-auto bg-cream-deep p-8 rounded-3xl border border-gold/20 shadow-soft">
              <div className="text-center mb-8">
                <h1 className="font-heading text-3xl font-bold text-ink">Reset Password</h1>
                <p className="text-ink/70 mt-2 font-body">Choose a new password for your account.</p>
              </div>
              <Suspense fallback={null}>
                <ResetPasswordForm />
              </Suspense>
            </div>
          </main>
          <Footer />
        </CartProvider>
      </WishlistProvider>
    </ToastProvider>
  )
}
