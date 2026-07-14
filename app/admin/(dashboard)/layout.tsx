// import { createClient } from '@/lib/supabase/server'
// import { redirect } from 'next/navigation'
// import AdminSidebar from '@/components/admin/Sidebar'
// import AdminHeader from '@/components/admin/Header'

// export default async function AdminDashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   // Server-side admin authorization check
//   const supabase = await createClient()
//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   if (!user) {
//     redirect('/admin/login')
//   }

//   // Verify admin role
//   const { data: profile } = await supabase
//     .from('profiles')
//     .select('role')
//     .eq('id', user.id)
//     .single()

//   if (!profile || profile.role !== 'admin') {
//     redirect('/admin/login')
//   }

//   return (
//     <div className="flex h-screen overflow-hidden bg-stone-50">
//       <AdminSidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <AdminHeader />
//         <main className="flex-1 overflow-y-auto p-6">{children}</main>
//       </div>
//     </div>
//   )
// }
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/Header'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  // 1. Read your explicit verification cookies
  const isMockAdmin = cookieStore.get('mock-admin-logged-in')?.value === 'true'
  const isBoujeeAdmin = cookieStore.get('boujee-admin-logged-in')?.value === 'true'

  // 2. ✅ INSTANT BYPASS GATE: If they don't have the cookies, bounce them out immediately (0ms)
  if (!isMockAdmin && !isBoujeeAdmin) {
    redirect('/admin/login')
  }

  // 3. Render the original layout interface shell cleanly using your custom verification values
  return (
    <div className="flex h-screen overflow-hidden bg-stone-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Renders your original sidebar panels without changes */}
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

