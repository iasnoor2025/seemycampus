"use client"

import Link from "next/link"
import { LogIn, User } from "lucide-react"
import { useSession } from "next-auth/react"

export function HeaderAuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center gap-1 text-white/50 text-xs font-medium uppercase tracking-wide whitespace-nowrap flex-shrink-0">
        <LogIn className="h-4 w-4" />
        <span>LOADING</span>
      </div>
    )
  }

  if (session?.user) {
    return (
      <Link
        href="/student/dashboard"
        className="flex items-center gap-1 text-white hover:text-red-400 transition-colors text-xs font-medium uppercase tracking-wide whitespace-nowrap flex-shrink-0"
        aria-label="My Dashboard"
      >
        <User className="h-4 w-4 flex-shrink-0" />
        <span>DASHBOARD</span>
      </Link>
    )
  }

  return (
    <Link
      href="/auth/signin"
      className="flex items-center gap-1 text-white hover:text-red-400 transition-colors text-xs font-medium uppercase tracking-wide whitespace-nowrap flex-shrink-0"
      aria-label="Sign In"
    >
      <LogIn className="h-4 w-4 flex-shrink-0" />
      <span>SIGN IN</span>
    </Link>
  )
}

