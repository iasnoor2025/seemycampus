import { Metadata } from "next"
import { ChatInterface } from "@/components/chat/ChatInterface"

export const metadata: Metadata = {
  title: "AI Chat Assistant | SeeMyCampus",
  description: "Chat with our AI assistant to get answers about colleges, courses, and admissions.",
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

