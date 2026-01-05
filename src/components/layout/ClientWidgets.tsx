"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import heavy components to reduce initial bundle size
// Load only after initial render to improve LCP
const ContactFormPopup = dynamic(
  () => import("@/components/contact/ContactFormPopup").then(mod => ({ default: mod.ContactFormPopup })),
  { 
    ssr: false,
    loading: () => null,
  }
)

const ChatbotWidget = dynamic(
  () => import("@/components/chat/ChatbotWidget").then(mod => ({ default: mod.ChatbotWidget })),
  { 
    ssr: false,
    loading: () => null,
  }
)

export function ClientWidgets() {
  const [shouldLoad, setShouldLoad] = useState(false)

  // Defer loading until after initial render and user interaction
  useEffect(() => {
    // Load after a short delay to not block initial render
    const timer = setTimeout(() => {
      setShouldLoad(true)
    }, 2000) // Load after 2 seconds

    // Also load on user interaction
    const handleInteraction = () => {
      setShouldLoad(true)
      clearTimeout(timer)
    }

    window.addEventListener('mousedown', handleInteraction, { once: true })
    window.addEventListener('touchstart', handleInteraction, { once: true })
    window.addEventListener('scroll', handleInteraction, { once: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousedown', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)
    }
  }, [])

  if (!shouldLoad) {
    return null
  }

  return (
    <>
      <ContactFormPopup />
      <ChatbotWidget />
    </>
  )
}

