import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const url = req.nextUrl.clone()

  // URL Canonicalization: Remove trailing slashes (except for root)
  if (pathname !== "/" && pathname.endsWith("/")) {
    url.pathname = pathname.slice(0, -1)
    return NextResponse.redirect(url, 301)
  }

  // URL Canonicalization: Force HTTPS and preferred domain
  const hostname = req.headers.get("host") || ""
  const preferredHost = process.env.NEXT_PUBLIC_PREFERRED_HOST
  
  // Only redirect if preferred host is set and different
  if (preferredHost && hostname !== preferredHost) {
    // Check if it's a www/non-www difference
    const hostnameWithoutWww = hostname.replace(/^www\./, '')
    const preferredWithoutWww = preferredHost.replace(/^www\./, '')
    
    if (hostnameWithoutWww === preferredWithoutWww) {
      // Only www/non-www difference - redirect
      url.hostname = preferredHost
      return NextResponse.redirect(url, 301)
    }
  }

  // Force HTTPS in production (only if not already HTTPS)
  if (process.env.NODE_ENV === "production" && req.nextUrl.protocol === "http:") {
    url.protocol = "https:"
    return NextResponse.redirect(url, 301)
  }

  // Protect admin routes - require admin role
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
    const userRole = (req.auth?.user as any)?.role
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Protect dashboard routes - require admin role
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
    const userRole = (req.auth?.user as any)?.role
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

