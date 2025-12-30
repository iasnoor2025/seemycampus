import { Metadata } from "next"
import { ChatInterface } from "@/components/chat/ChatInterface"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  title: "AI Chat Assistant | SeeMyCampus",
  description: "Chat with our AI assistant to get answers about colleges, courses, and admissions. Get instant guidance on your educational journey.",
  keywords: ["AI chat", "college guidance", "admission help", "education chatbot", "college counseling AI"],
  openGraph: {
    title: "AI Chat Assistant | SeeMyCampus",
    description: "Chat with our AI assistant to get answers about colleges, courses, and admissions. Get instant guidance on your educational journey.",
    url: `${baseUrl}/chat`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/main-logo-xxxx.png`,
        width: 1200,
        height: 630,
        alt: "AI Chat Assistant - SeeMyCampus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Chat Assistant | SeeMyCampus",
    description: "Chat with our AI assistant to get answers about colleges, courses, and admissions.",
  },
  alternates: {
    canonical: `${baseUrl}/chat`,
  },
}

import { MessageCircle } from "lucide-react"

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 shadow-lg">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium text-sm">AI Assistant</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              AI Chat Assistant
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Ask me anything about colleges, courses, admissions, or educational guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Chat Interface */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <ChatInterface />
        </div>
      </section>
    </div>
  )
}

