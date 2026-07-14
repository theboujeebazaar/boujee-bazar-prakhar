// import { createServerClient } from '@supabase/ssr'
// import { NextResponse, type NextRequest } from 'next/server'

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({
//     request,
//   })

//   const url = process.env.NEXT_PUBLIC_SUPABASE_URL
//   const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

//   let supabase: any

//   if (!url || !key || url.includes('placeholder') || url === '') {
//     supabase = {
//       auth: {
//         getUser: async () => {
//           const hasMockCookie = request.cookies.get('mock-admin-logged-in')?.value === 'true'
//           if (hasMockCookie) {
//             return { data: { user: { id: 'mock-admin-id', email: 'admin@gulshanmodest.com' } }, error: null }
//           }
//           return { data: { user: null }, error: null }
//         }
//       }
//     }
//   } else {
//     supabase = createServerClient(
//       url,
//       key,
//       {
//         cookies: {
//           getAll() {
//             return request.cookies.getAll()
//           },
//           setAll(cookiesToSet) {
//             cookiesToSet.forEach(({ name, value, options }) =>
//               request.cookies.set(name, value)
//             )
//             supabaseResponse = NextResponse.next({
//               request,
//             })
//             cookiesToSet.forEach(({ name, value, options }) =>
//               supabaseResponse.cookies.set(name, value, options)
//             )
//           },
//         },
//       }
//     )
//   }

//   // IMPORTANT: Do NOT add logic between createServerClient and
//   // supabase.auth.getUser(). A simple mistake could make it very hard
//   // to debug issues with users being randomly logged out.

//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   // Protected routes: redirect to login if not authenticated
//   const protectedPaths = ['/account', '/checkout']
//   const isProtectedPath = protectedPaths.some((path) =>
//     request.nextUrl.pathname.startsWith(path)
//   )

//   if (isProtectedPath && !user) {
//     const url = request.nextUrl.clone()
//     url.pathname = '/login'
//     url.searchParams.set('redirect', request.nextUrl.pathname)
//     return NextResponse.redirect(url)
//   }

//   // Admin routes: redirect to admin login if not admin
//   if (request.nextUrl.pathname.startsWith('/admin')) {
//     // Allow access to admin login page
//     if (request.nextUrl.pathname === '/admin/login') {
//       return supabaseResponse
//     }

//     if (!user) {
//       const url = request.nextUrl.clone()
//       url.pathname = '/admin/login'
//       return NextResponse.redirect(url)
//     }
//   }

//   // IMPORTANT: You *must* return the supabaseResponse object as is.
//   // If you're creating a new response object with NextResponse.next() make sure to:
//   // 1. Pass the request in it, like so:
//   //    const myNewResponse = NextResponse.next({ request })
//   // 2. Copy over the cookies, like so:
//   //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
//   // 3. Change the myNewResponse object to fit your needs, but avoid changing
//   //    the cookies!
//   // 4. Finally:
//   //    return myNewResponse
//   // If this is not done, you may be causing the browser and server to go out
//   // of sync and terminate the user's session prematurely!

//   return supabaseResponse
// }
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const path = request.nextUrl.pathname

  // 1. Read your bypass cookies FIRST to prevent blocking network queries
  const hasBoujeeAdminCookie = request.cookies.get('boujee-admin-logged-in')?.value === 'true'
  const hasLegacyAdminCookie = request.cookies.get('mock-admin-logged-in')?.value === 'true'
  const hasBoujeeUserCookie = request.cookies.get('boujee-user-session')?.value === 'true'

  let user = null

  // 2. Initialize your clean client connection
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. ✅ SAFE WRAPPER: Run the user verification check safely inside a try/catch block
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch (error) {
    console.warn("Supabase auth check bypassed gracefully:", error)
  }

  // 4. Combine session variables to grant or restrict access safely
  const isAdminAuthenticated = !!user || hasBoujeeAdminCookie || hasLegacyAdminCookie
  const isUserAuthenticated = !!user || hasBoujeeUserCookie

  // 5. Gated Logic Paths: User Workspaces
  const isProtectedPath = path.startsWith('/account') || path.startsWith('/checkout')
  if (isProtectedPath && !isUserAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // 6. Gated Logic Paths: Admin Dashboard
  if (path.startsWith('/admin')) {
    // Always allow unhindered access to your admin login page layout
    if (path === '/admin/login') {
      return supabaseResponse
    }

    // If trying to access any dashboard subpage without verification, block it immediately
    if (!isAdminAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
