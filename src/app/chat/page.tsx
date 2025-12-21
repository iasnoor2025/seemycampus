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

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Chat Assistant</h1>
        <p className="text-muted-foreground">
          Ask me anything about colleges, courses, admissions, or educational guidance.
        </p>
      </div>
      <ChatInterface />
    </div>
  )
}

