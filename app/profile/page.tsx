import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProfileManager from './_components/ProfileManager'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'My Profile | The Boujee Bazaar',
  description: 'Manage your shipping address, contact details, and order tracking.',
}

export default async function CustomerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/profile')
  }
  
  let adminProfile = null
  let orders = []
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const { data: address } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: userOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (userOrders) {
      orders = userOrders
    }

    const lastOrder = orders[0] as any

    // Read cookie fallback if any
    let cookieProfile: any = null
    try {
      const cookieStore = await cookies()
      const profileCookie = cookieStore.get('boujee-customer-profile-token')?.value
      if (profileCookie) {
        cookieProfile = JSON.parse(decodeURIComponent(profileCookie))
      }
    } catch (e) {
      console.warn("Failed to parse cookie profile:", e)
    }

    adminProfile = {
      email: user.email || '',
      full_name: profile?.full_name || lastOrder?.customer_name || cookieProfile?.fullName || user.user_metadata?.full_name || user.user_metadata?.name || '',
      phone: profile?.phone || address?.phone || lastOrder?.customer_phone || cookieProfile?.phone || '',
      alternatePhone: address?.alternate_phone || cookieProfile?.alternatePhone || '',
      street: address?.address_line_1 || lastOrder?.shipping_street || cookieProfile?.street || '',
      city: address?.city || lastOrder?.shipping_city || cookieProfile?.city || '',
      state: address?.state || lastOrder?.shipping_state || cookieProfile?.state || '',
      zipCode: address?.postal_code || lastOrder?.shipping_pincode || cookieProfile?.zipCode || '',
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-8">
            <div className="eyebrow justify-center inline-flex items-center gap-2">
              <span className="h-px w-6 bg-gold" />
              Customer Account
              <span className="h-px w-6 bg-gold" />
            </div>
            <h1 className="section-heading mt-3">My Profile</h1>
            <p className="section-sub mt-2">
              Manage your default shipping address and order details for quicker checkouts.
            </p>
          </div>

          <ProfileManager adminProfile={adminProfile} orders={orders} />
        </div>
      </main>
      <Footer />
    </>
  )
}
