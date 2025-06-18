import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url)

  try {
    // Check if we're trying to access a protected route
    if (requestUrl.pathname.startsWith("/dashboard")) {
      console.log("Middleware: Checking dashboard access")
      
      // Debug: Log all cookies to see what's available
      const allCookies = request.cookies.getAll()
      console.log("Middleware: All cookies:", allCookies.map(c => `${c.name}: ${c.value.substring(0, 15)}...`).join(", "))
      
      // Look for the Supabase auth token cookie with different patterns
      const authCookie = request.cookies.getAll().find(cookie => 
        (cookie.name.includes('auth-token') && cookie.name.startsWith('sb-')) ||
        cookie.name.includes('supabase') ||
        cookie.name.includes('auth')
      )
      
      console.log("Middleware: Found potential auth cookie:", authCookie?.name || "None")
      
      if (!authCookie) {
        console.log("Middleware: No auth cookie found, redirecting to login")
        const redirectUrl = new URL("/login", requestUrl.origin)
        redirectUrl.searchParams.set("redirectedFrom", requestUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
      
      console.log("Middleware: Found auth cookie, allowing access")
    }

    return NextResponse.next()
  } catch (e) {
    console.error("Middleware error:", e)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
