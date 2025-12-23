"use client"

import { useState, useRef, useEffect } from "react"
import { ChatInput } from "./ChatInput"
import { MessageList } from "./MessageList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: CollegeSuggestion[]
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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm here to help you with questions about colleges, courses, and admissions. How can I assist you today?",
      timestamp: new Date(),
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
        body: JSON.stringify({ message: content }),
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
          <MessageList messages={messages} />
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
        <div className="border-t p-4">
          <ChatInput onSend={handleSendMessage} disabled={loading} />
        </div>
      </CardContent>
    </Card>
  )
}

