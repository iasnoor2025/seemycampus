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

const getWelcomeMessage = (pathname: string | null): string => {
  return "Hi! How can I help you today?"
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
  const welcomeMessage = getWelcomeMessage(pathname)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant" as const,
      content: welcomeMessage,
      timestamp: new Date(),
      showQuickReplies: false,
    }
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      })
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }

  // Scroll to show the start of the latest message (user or assistant)
  const scrollToLatestMessage = () => {
    if (scrollContainerRef.current && messages.length > 0) {
      // Get the last message (could be user or assistant)
      const lastMessageIndex = messages.length - 1
      const lastMessage = messages[lastMessageIndex]
      
      if (lastMessage) {
        // Get all message elements
        const messageElements = scrollContainerRef.current.querySelectorAll('[data-message-index]')
        if (messageElements[lastMessageIndex]) {
          // Scroll to show the start of the latest message
          messageElements[lastMessageIndex].scrollIntoView({ 
            behavior: "smooth", 
            block: "start",
            inline: "nearest"
          })
        } else {
          // Fallback: scroll to bottom if element not found
          scrollToBottom()
        }
      }
    }
  }

  // Scroll to top when page loads (show first message)
  useEffect(() => {
    if (messages.length > 0 && scrollContainerRef.current) {
      // Scroll to top to show the first message
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "auto"
      })
    }
  }, []) // Only run once on mount

  // Auto-scroll to show the start of latest message (user or assistant)
  useEffect(() => {
    if (messages.length > 0) {
      // Scroll to show latest message (whether user or assistant)
      // Small delay to ensure DOM is updated with new message
      const timeoutId = setTimeout(() => {
        scrollToLatestMessage()
      }, 200)
      
      return () => clearTimeout(timeoutId)
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
          content: data.response || data.fallback || "How can I help you?",
          timestamp: new Date(),
          suggestions: data.suggestions || [],
          showQuickReplies: false,
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
        showQuickReplies: false,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleClearChat = () => {
    const welcomeMessage = getWelcomeMessage(pathname)
    setMessages([{
      role: "assistant" as const,
      content: welcomeMessage,
      timestamp: new Date(),
      showQuickReplies: false,
    }])
  }

  return (
    <Card className="flex flex-col h-[700px] max-w-4xl mx-auto shadow-2xl border border-gray-200/60 rounded-2xl backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200/60 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white p-4 relative overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
        
        <CardTitle className="text-lg font-semibold relative z-10 flex items-center gap-3">
          {/* Avatar with bot icon */}
          <div className="relative flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-blue-600 animate-pulse shadow-lg shadow-green-400/50" />
          </div>
          <span className="text-white font-bold">
            SeeMyCampus Assistant
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
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/20 relative">
        {/* Modern subtle background pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Soft gradient overlay */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)
            `,
          }} />
        </div>
        
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent relative z-10">
          <MessageList 
            messages={messages} 
            onQuickReply={handleSendMessage}
            disabled={loading}
          />
          {loading && (
            <div className="flex items-center gap-2 text-gray-600 text-sm mt-4 ml-11">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="ml-2 font-medium">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Footer with branding */}
        <div className="border-t border-gray-200/60 bg-white/80 backdrop-blur-sm p-5 space-y-3 relative z-10">
          <ChatInput onSend={handleSendMessage} disabled={loading} />
          {/* Footer branding */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <Bot className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700">SeeMyCampus</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">Powered by AI</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

