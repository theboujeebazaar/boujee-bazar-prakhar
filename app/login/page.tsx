import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthForm from './_components/AuthForm'
import { ToastProvider } from '@/context/ToastContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { CartProvider } from '@/context/CartContext'

export const metadata = {
  title: 'Login | The Boujee Bazaar',
  description: 'Login securely with your phone number and password.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams

  return (
    <ToastProvider>
      <WishlistProvider>
        <CartProvider>
          <Header />
          <main className="min-h-screen bg-cream flex flex-col justify-center pt-36 pb-20 px-5">
            <div className="max-w-md w-full mx-auto bg-cream-deep p-8 rounded-3xl border border-gold/20 shadow-soft">
              <div className="text-center mb-8">
                <h1 className="font-heading text-3xl font-bold text-ink">Welcome</h1>
                <p className="text-ink/70 mt-2 font-body">
                  Log in or create an account to track orders and checkout faster.
                </p>
              </div>
              <AuthForm redirectTo={redirect} />
            </div>
          </main>
          <Footer />
        </CartProvider>
      </WishlistProvider>
    </ToastProvider>
  )
}
