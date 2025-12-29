"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ChatInput } from "./ChatInput"
import { MessageList } from "./MessageList"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, MessageCircle, Trash2, Minimize2 } from "lucide-react"
import { Message, CollegeSuggestion } from "./ChatInterface"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "seemycampus_chat_history"

export function ChatbotWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Hide widget on dashboard, admin, auth, and chat pages
  const shouldHide = pathname?.startsWith("/dashboard") || 
                     pathname?.startsWith("/admin") || 
                     pathname?.startsWith("/auth") ||
                     pathname === "/chat"

  if (shouldHide) {
    return null
  }

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY)
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory)
        // Convert timestamp strings back to Date objects
        const history = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        if (history.length > 0) {
          setMessages(history)
        } else {
          // Initialize with welcome message if no history
          setMessages([
            {
              role: "assistant",
              content: "Hello! I'm here to help you with questions about colleges, courses, and admissions. How can I assist you today?",
              timestamp: new Date(),
            },
          ])
        }
      } else {
        // Initialize with welcome message
        setMessages([
          {
            role: "assistant",
            content: "Hello! I'm here to help you with questions about colleges, courses, and admissions. How can I assist you today?",
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
      setMessages([
        {
          role: "assistant",
          content: "Hello! I'm here to help you with questions about colleges, courses, and admissions. How can I assist you today?",
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } catch (error) {
        console.error("Error saving chat history:", error)
      }
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
    }
  }, [messages, isOpen, isMinimized])

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
      // Get conversation history for context (last 10 messages)
      const recentHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          history: recentHistory,
          includeColleges: true,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          suggestions: data.suggestions || [],
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || "Failed to get response")
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. How can I help you?",
        timestamp: new Date(),
      },
    ])
    localStorage.removeItem(STORAGE_KEY)
  }

  const handleToggle = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized)
    } else {
      setIsOpen(true)
      setIsMinimized(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={handleToggle}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 bg-[#18254a] hover:bg-[#1a2d5a]"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 transition-all duration-300",
            "w-[calc(100vw-3rem)] sm:w-[380px]",
            isMinimized ? "h-16" : "h-[calc(100vh-12rem)] sm:h-[600px] max-h-[600px]"
          )}
        >
          <Card className="flex flex-col h-full shadow-2xl border-2">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-[#18254a] text-white p-4">
              <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  title="Clear chat"
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Expand" : "Minimize"}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  title="Close"
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            {!isMinimized && (
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                  <MessageList messages={messages} />
                  {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-4">
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span className="ml-2">Thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t p-4">
                  <ChatInput onSend={handleSendMessage} disabled={loading} />
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  )
}

