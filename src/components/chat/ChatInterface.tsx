"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ChatInput } from "./ChatInput"
import { MessageList } from "./MessageList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Bot } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

// Enhanced welcome messages - split into multiple for better UX
const getWelcomeMessages = (pathname: string | null): string[] => {
  if (pathname?.startsWith("/colleges/")) {
    return [
      "Hello, Welcome to SeeMyCampus. I am your smart admission assistant.",
      "I can help you learn more about this college, compare it with others, or answer questions about admissions, courses, and fees.",
      "How can I help you today?"
    ]
  }
  if (pathname?.startsWith("/colleges")) {
    return [
      "Hello, Welcome to SeeMyCampus. I am your smart admission assistant.",
      "I'm here to help you find the perfect college. I can help you search for colleges, compare options, understand admission requirements, or answer any questions about courses and programs.",
      "How can I help you today?"
    ]
  }
  if (pathname?.startsWith("/courses")) {
    return [
      "Hello, Welcome to SeeMyCampus. I am your smart admission assistant.",
      "I can help you explore courses, understand requirements, find colleges offering specific programs, or answer questions about career paths.",
      "How can I help you today?"
    ]
  }
  if (pathname?.startsWith("/scholarships")) {
    return [
      "Hello, Welcome to SeeMyCampus. I am your smart admission assistant.",
      "I can help you find scholarship opportunities, understand eligibility criteria, or answer questions about financial aid.",
      "How can I help you today?"
    ]
  }
  return [
    "Hello, Welcome to SeeMyCampus. I am your smart admission assistant.",
    "I can help you with finding the right colleges and courses, understanding admission requirements, exploring scholarship opportunities, career counseling guidance, and fee calculations.",
    "How can I help you today?"
  ]
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
  const welcomeMessages = getWelcomeMessages(pathname)
  const [messages, setMessages] = useState<Message[]>(
    welcomeMessages.map((msg, index) => ({
      role: "assistant" as const,
      content: msg,
      timestamp: new Date(),
      showQuickReplies: index === welcomeMessages.length - 1, // Show quick replies only on last message
    }))
  )
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Only auto-scroll if user is already near the bottom (within 150px)
  useEffect(() => {
    if (scrollContainerRef.current && messagesEndRef.current) {
      const scrollContainer = scrollContainerRef.current
      const distanceFromBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight
      // Only scroll if user is within 150px of bottom
      if (distanceFromBottom < 150) {
        setTimeout(() => scrollToBottom(), 100)
      }
    }
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
    const welcomeMessages = getWelcomeMessages(pathname)
    const initialMessages = welcomeMessages.map((msg, index) => ({
      role: "assistant" as const,
      content: msg,
      timestamp: new Date(),
      showQuickReplies: index === welcomeMessages.length - 1,
    }))
    setMessages(initialMessages)
  }

  return (
    <Card className="flex flex-col h-[700px] max-w-4xl mx-auto shadow-2xl border-2 border-gray-300 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-[#18254a] via-[#1a2d5a] to-[#18254a] text-white p-4 relative overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
        
        {/* Futuristic tech grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }} />
        </div>
        
        <CardTitle className="text-lg font-semibold relative z-10 flex items-center gap-3">
          {/* Avatar with bot icon */}
          <div className="relative flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-[#18254a] animate-pulse shadow-lg shadow-green-400/50" />
          </div>
          <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent font-bold">
            SeeMyCampus
          </span>
        </CardTitle>
        <div className="flex items-center gap-2 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            title="Clear chat"
            className="min-h-[44px] min-w-[44px] text-white hover:text-white hover:bg-white/20 transition-all duration-200 rounded-lg"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-white relative">
        {/* Futuristic gradient mesh background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle gradient mesh */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(24, 37, 74, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(26, 45, 90, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
            `,
          }} />
          {/* Subtle grid lines - futuristic tech grid */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `
              linear-gradient(rgba(24, 37, 74, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(24, 37, 74, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative z-10">
          <MessageList 
            messages={messages} 
            onQuickReply={handleSendMessage}
            disabled={loading}
          />
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-4">
              <div className="h-2 w-2 bg-[#18254a] rounded-full animate-bounce" />
              <div className="h-2 w-2 bg-[#18254a] rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="h-2 w-2 bg-[#18254a] rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 font-medium">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Footer with branding */}
        <div className="border-t-2 border-gray-300 bg-white p-5 space-y-3 relative z-10">
          <ChatInput onSend={handleSendMessage} disabled={loading} />
          {/* Footer branding */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#18254a] to-[#1a2d5a] flex items-center justify-center shadow-sm">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700">SeeMyCampus</span>
            </div>
            <span className="text-xs text-gray-600 font-medium">Powered by AI</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

