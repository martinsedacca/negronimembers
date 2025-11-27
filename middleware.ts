import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// APP_MODE determines which section of the app to show
// - 'member': Member app (negronimembers.com)
// - 'admin': Admin dashboard (admin.negronimembers.com)
// - 'manager': Scanner app (manager.negronimembers.com)
const APP_MODE = process.env.NEXT_PUBLIC_APP_MODE || 'all'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle app mode routing
  if (APP_MODE !== 'all') {
    // Root path redirect based on mode
    if (pathname === '/') {
      const redirectMap: Record<string, string> = {
        member: '/member',
        admin: '/dashboard',
        manager: '/scanner',
      }
      const redirectTo = redirectMap[APP_MODE]
      if (redirectTo) {
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }
    }
    
    // Block access to other app sections
    const blockedPaths: Record<string, string[]> = {
      member: ['/dashboard', '/scanner'],
      admin: ['/member', '/scanner'],
      manager: ['/member', '/dashboard'],
    }
    
    const blocked = blockedPaths[APP_MODE] || []
    for (const blockedPath of blocked) {
      if (pathname.startsWith(blockedPath)) {
        // Redirect to the correct section
        const redirectMap: Record<string, string> = {
          member: '/member',
          admin: '/dashboard',
          manager: '/scanner',
        }
        return NextResponse.redirect(new URL(redirectMap[APP_MODE], request.url))
      }
    }
  }
  
  // Continue with session update
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
