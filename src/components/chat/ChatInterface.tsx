"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ChatInput } from "./ChatInput"
import { MessageList } from "./MessageList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const getWelcomeMessage = (pathname: string | null): string => {
  if (pathname?.startsWith("/colleges/")) {
    return "Hello! I can help you learn more about this college, compare it with others, or answer questions about admissions, courses, and fees. What would you like to know?"
  }
  if (pathname?.startsWith("/colleges")) {
    return "Hello! I'm here to help you find the perfect college. I can help you search for colleges, compare options, understand admission requirements, or answer any questions about courses and programs. How can I assist you today?"
  }
  if (pathname?.startsWith("/courses")) {
    return "Hello! I can help you explore courses, understand requirements, find colleges offering specific programs, or answer questions about career paths. What would you like to know?"
  }
  if (pathname?.startsWith("/scholarships")) {
    return "Hello! I can help you find scholarship opportunities, understand eligibility criteria, or answer questions about financial aid. How can I assist you?"
  }
  return "Hello! I'm your AI assistant for SeeMyCampus. I can help you with:\n• Finding the right colleges and courses\n• Understanding admission requirements\n• Exploring scholarship opportunities\n• Career counseling guidance\n• Fee calculations\n\nWhat would you like to explore today?"
}

export interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: CollegeSuggestion[]
  showQuickReplies?: boolean
}

export interface CollegeSuggestion {
  id: number
  name: string
  slug: string
  location: string | null
  city: string | null
  description: string | null
  ranking: number | null
}

export function ChatInterface() {
  const pathname = usePathname()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: getWelcomeMessage(pathname),
      timestamp: new Date(),
      showQuickReplies: true,
    },
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || loading) return

    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: content,
          history: messages.slice(-10).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          includeColleges: true,
          context: {
            pathname: pathname || "",
          },
        }),
      })

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()

      // Handle both success and error responses gracefully
      if (data.success || data.response) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response || data.fallback || "I'm here to help! How can I assist you today?",
          timestamp: new Date(),
          suggestions: data.suggestions || [],
          showQuickReplies: messages.length >= 2 && messages.length % 3 === 0,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || "Failed to get response")
      }
    } catch (error: any) {
      console.error("Chat error:", error)
      let errorMessage = "I'm sorry, I'm having trouble processing your request right now."
      
      if (error.message?.includes("rate limit") || error.message?.includes("429")) {
        errorMessage = "I'm receiving too many requests. Please wait a moment and try again. You can also visit our help pages or contact support for immediate assistance."
      } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
        errorMessage = "I'm having trouble connecting. Please check your internet connection and try again. You can also visit our FAQ page or contact support."
      }
      
      const errorMsg: Message = {
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
        showQuickReplies: true,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: getWelcomeMessage(pathname),
        timestamp: new Date(),
        showQuickReplies: true,
      },
    ])
  }

  return (
    <Card className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <CardTitle>AI Assistant</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearChat}
          title="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList 
            messages={messages} 
            onQuickReply={handleSendMessage}
            disabled={loading}
          />
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <div className="h-2 w-2 bg-current rounded-full animate-bounce" />
              <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-4 space-y-3">
          <ChatInput onSend={handleSendMessage} disabled={loading} />
        </div>
      </CardContent>
    </Card>
  )
}

