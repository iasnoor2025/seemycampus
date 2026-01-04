"use client"

import dynamic from "next/dynamic"

// Dynamically import heavy components to reduce initial bundle size
const ContactFormPopup = dynamic(
  () => import("@/components/contact/ContactFormPopup").then(mod => ({ default: mod.ContactFormPopup })),
  { 
    ssr: false,
    loading: () => null, // Don't show loading state for popup
  }
)

const ChatbotWidget = dynamic(
  () => import("@/components/chat/ChatbotWidget").then(mod => ({ default: mod.ChatbotWidget })),
  { 
    ssr: false,
    loading: () => null, // Don't show loading state for widget
  }
)

export function ClientWidgets() {
  return (
    <>
      <ContactFormPopup />
      <ChatbotWidget />
    </>
  )
}

