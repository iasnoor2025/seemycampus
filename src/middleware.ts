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
  const preferredHost = process.env.NEXT_PUBLIC_PREFERRED_HOST || "seemycampus.com"
  
  // Redirect www to non-www (or vice versa based on preferred host)
  if (hostname.startsWith("www.") && !preferredHost.startsWith("www.")) {
    url.hostname = preferredHost
    return NextResponse.redirect(url, 301)
  }

  // Force HTTPS in production
  if (process.env.NODE_ENV === "production" && url.protocol === "http:") {
    url.protocol = "https:"
    return NextResponse.redirect(url, 301)
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

