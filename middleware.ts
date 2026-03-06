import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/callback', '/api/webhooks']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/webhooks'))

  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin')

  // Protected routes (dashboard, campaigns, etc.)
  const isProtectedRoute = !isPublicRoute && !pathname.startsWith('/_next') && !pathname.startsWith('/api/track')

  // Redirect unauthenticated users from protected routes
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check admin access for admin routes
  if (user && isAdminRoute) {
    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdminUser = profile?.role === 'admin' || profile?.role === 'super_admin'

    if (!isAdminUser) {
      // Redirect non-admins to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
