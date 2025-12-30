"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SimpleContactForm } from "@/components/quiz/SimpleContactForm"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ContactFormPopup() {
  const pathname = usePathname()
  const { data: session, status: sessionStatus } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const lastClickTime = useRef<number>(0)
  const lastScrollTime = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check if contact form has been submitted
  const checkContactFormStatus = async () => {
    try {
      const submitted = localStorage.getItem("contactFormSubmitted") === "true"
      const storedEmail = localStorage.getItem("contactFormEmail")

      if (submitted && storedEmail) {
        // Verify the lead actually exists in database
        const response = await fetch(`/api/leads?email=${encodeURIComponent(storedEmail)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.leads && data.leads.length > 0) {
            setHasSubmitted(true)
            setIsChecking(false)
            return
          }
        }
      }

      // If no valid lead found, clear localStorage
      if (submitted) {
        localStorage.removeItem("contactFormSubmitted")
        localStorage.removeItem("contactFormEmail")
        localStorage.removeItem("contactFormPhone")
        localStorage.removeItem("contactFormName")
      }

      setHasSubmitted(false)
      setIsChecking(false)
    } catch (error) {
      console.error("Error checking contact form status:", error)
      setHasSubmitted(false)
      setIsChecking(false)
    }
  }

  // Check if user is admin via API (more reliable than client-side session)
  const checkAdminStatus = useCallback(async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          if (data?.user?.role === "admin") {
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
          }
        } else {
          setIsAdmin(false)
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        // Silently handle network errors and timeouts
        if (fetchError.name === 'AbortError') {
          // Timeout - silently fail, don't log
          setIsAdmin(false)
        } else if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
          // Network error - silently fail, don't log
          setIsAdmin(false)
        } else {
          // Other errors - log but don't break
          console.warn("Error checking admin status:", fetchError)
          setIsAdmin(false)
        }
      }
    } catch (error) {
      // Outer catch for any unexpected errors
      setIsAdmin(false)
    } finally {
      setIsCheckingAdmin(false)
    }
  }, [])

  useEffect(() => {
    checkContactFormStatus()
    checkAdminStatus()
  }, [checkAdminStatus])

  // Re-check admin status when session changes
  // Prefer session hook over API call for better performance
  useEffect(() => {
    if (sessionStatus === "loading") {
      setIsCheckingAdmin(true)
      return
    }

    // Use session hook directly first (faster, no API call)
    if (session?.user?.role === "admin") {
      setIsAdmin(true)
      setIsCheckingAdmin(false)
      return
    } else if (sessionStatus === "unauthenticated") {
      setIsAdmin(false)
      setIsCheckingAdmin(false)
      return
    }

    // Only make API call if session is authenticated but role is not clear
    // This is a fallback for edge cases
    if (sessionStatus === "authenticated" && session?.user && !session.user.role) {
      checkAdminStatus().catch(() => {
        // Silently handle errors
        setIsAdmin(false)
        setIsCheckingAdmin(false)
      })
    } else {
      setIsAdmin(false)
      setIsCheckingAdmin(false)
    }
  }, [sessionStatus, session, checkAdminStatus])

  // Periodic check for admin status (every 30 seconds) to catch new logins
  // Reduced frequency to avoid excessive API calls and network errors
  useEffect(() => {
    // Only set up interval if we're not already checking
    if (isCheckingAdmin) {
      return
    }
    
    const interval = setInterval(() => {
      // Only check if not currently checking to avoid overlapping requests
      if (!isCheckingAdmin) {
        checkAdminStatus().catch(() => {
          // Silently handle any errors from the periodic check
        })
      }
    }, 30000) // Check every 30 seconds instead of 5

    return () => clearInterval(interval)
  }, [checkAdminStatus, isCheckingAdmin])

  // Don't show popup on quiz, contact, dashboard, or admin pages, or if user is admin
  // Wait for both checks to complete before deciding
  const shouldShowPopup = 
    !isCheckingAdmin &&
    !isAdmin &&
    !pathname?.includes("/quiz") && 
    !pathname?.includes("/contact") &&
    !pathname?.includes("/dashboard") &&
    !pathname?.includes("/admin") &&
    !pathname?.includes("/auth")

  // Lock body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY
      // Lock body scroll
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
      if (scrollY) {
        const scrollValue = parseInt(scrollY.replace("px", "") || "0", 10) * -1
        window.scrollTo(0, scrollValue)
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Show popup every 10 seconds if not submitted
  useEffect(() => {
    if (isChecking || isCheckingAdmin || hasSubmitted || !shouldShowPopup || isAdmin) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setIsOpen(true)
    }, 10000) // 10 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isChecking, isCheckingAdmin, hasSubmitted, shouldShowPopup, isAdmin])

  // Show popup on every click if not submitted (with debounce)
  useEffect(() => {
    if (isChecking || isCheckingAdmin || hasSubmitted || !shouldShowPopup || isAdmin) return

    const handleClick = (e: MouseEvent) => {
      const now = Date.now()
      // Debounce: don't show if clicked within last 2 seconds
      if (now - lastClickTime.current < 2000) {
        return
      }
      lastClickTime.current = now

      // Don't show if clicking on dialog or its children
      const target = e.target as HTMLElement
      if (target.closest('[role="dialog"]')) {
        return
      }
      setIsOpen(true)
    }

    // Add click listener to document
    document.addEventListener("click", handleClick, true)

    return () => {
      document.removeEventListener("click", handleClick, true)
    }
  }, [isChecking, isCheckingAdmin, hasSubmitted, shouldShowPopup, isAdmin])

  // Show popup on scroll if not submitted (with debounce)
  useEffect(() => {
    if (isChecking || isCheckingAdmin || hasSubmitted || !shouldShowPopup || isAdmin) return

    const handleScroll = () => {
      const now = Date.now()
      // Debounce: don't show if scrolled within last 2 seconds
      if (now - lastScrollTime.current < 2000) {
        return
      }
      lastScrollTime.current = now

      // Don't show if popup is already open
      if (isOpen) {
        return
      }

      setIsOpen(true)
    }

    // Add scroll listener to window
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isChecking, isCheckingAdmin, hasSubmitted, shouldShowPopup, isOpen, isAdmin])

  const handleFormSuccess = () => {
    setHasSubmitted(true)
    setIsOpen(false)
    // Re-check status
    checkContactFormStatus()
  }

  if (isChecking || isCheckingAdmin || hasSubmitted || !shouldShowPopup || isAdmin) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Prevent closing - user must fill the form
      if (!open) {
        setIsOpen(true)
      } else {
        setIsOpen(open)
      }
    }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Get Started with SeeMyCampus</DialogTitle>
          <DialogDescription>
            Please provide your contact information to continue. It only takes a moment!
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <SimpleContactForm onSuccess={handleFormSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

