"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ChatInput } from "./ChatInput"
import { MessageList } from "./MessageList"
import { QuickReplies } from "./QuickReplies"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, MessageCircle, Trash2, Minimize2, Bot, RotateCcw } from "lucide-react"
import { Message, CollegeSuggestion } from "./ChatInterface"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "seemycampus_chat_history"
const USER_INFO_KEY = "seemycampus_user_info"

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

export function ChatbotWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [userInfo, setUserInfo] = useState<{ name?: string; phone?: string; email?: string } | null>(null)
  const [awaitingUserInfo, setAwaitingUserInfo] = useState<"name" | "phone" | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Track scroll position to detect when back-to-top button is visible
  useEffect(() => {
    const handleScroll = () => {
      // Back-to-top button appears when scrolled down 300px
      if (window.pageYOffset > 300) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    // Check initial state
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Hide widget on dashboard, admin, auth, and chat pages
  const shouldHide = pathname?.startsWith("/dashboard") || 
                     pathname?.startsWith("/admin") || 
                     pathname?.startsWith("/auth") ||
                     pathname === "/chat"

  if (shouldHide) {
    return null
  }

  // Load user info and chat history from localStorage on mount
  useEffect(() => {
    try {
      // Load user info
      const savedUserInfo = localStorage.getItem(USER_INFO_KEY)
      if (savedUserInfo) {
        const parsed = JSON.parse(savedUserInfo)
        setUserInfo(parsed)
      }

      // Load chat history
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
          // Initialize with welcome messages if no history
          const welcomeMessages = getWelcomeMessages(pathname)
          const initialMessages = welcomeMessages.map((msg, index) => ({
            role: "assistant" as const,
            content: msg,
              timestamp: new Date(),
            showQuickReplies: index === welcomeMessages.length - 1, // Show quick replies only on last message
          }))
          setMessages(initialMessages)
        }
      } else {
        // Initialize with welcome messages
        const welcomeMessages = getWelcomeMessages(pathname)
        const initialMessages = welcomeMessages.map((msg, index) => ({
          role: "assistant" as const,
          content: msg,
            timestamp: new Date(),
          showQuickReplies: index === welcomeMessages.length - 1, // Show quick replies only on last message
        }))
        setMessages(initialMessages)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
      const welcomeMessages = getWelcomeMessages(pathname)
      const initialMessages = welcomeMessages.map((msg, index) => ({
        role: "assistant" as const,
        content: msg,
          timestamp: new Date(),
        showQuickReplies: index === welcomeMessages.length - 1,
      }))
      setMessages(initialMessages)
    }
  }, [pathname])

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

  // Only auto-scroll if user is already near the bottom (within 150px)
  useEffect(() => {
    if (isOpen && !isMinimized && scrollContainerRef.current && messagesEndRef.current) {
      const scrollContainer = scrollContainerRef.current
      const distanceFromBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight
      // Only scroll if user is within 150px of bottom
      if (distanceFromBottom < 150) {
        setTimeout(() => scrollToBottom(), 100)
      }
    }
  }, [messages, isOpen, isMinimized])

  // Extract name and phone from message
  const extractUserInfo = (message: string): { name?: string; phone?: string } => {
    const info: { name?: string; phone?: string } = {}
    
    // Extract phone number (Indian format: 10 digits, may have +91, spaces, dashes, parentheses)
    const phoneRegex = /(\+91[\s-]?)?[6-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}|(\+91[\s-]?)?[6-9]\d{9}/g
    const phoneMatch = message.match(phoneRegex)
    if (phoneMatch) {
      // Clean phone number: remove spaces, dashes, parentheses, and +91
      info.phone = phoneMatch[0].replace(/[\s\-()]/g, '').replace(/\+91/, '').replace(/^91/, '')
      // Ensure it's exactly 10 digits
      if (info.phone.length === 10 && /^[6-9]/.test(info.phone)) {
        // Valid Indian mobile number
      } else {
        delete info.phone
      }
    }
    
    // Extract name (if message contains "my name is" or similar patterns)
    const namePatterns = [
      /(?:my name is|i'm|i am|name is|call me|this is)\s+([A-Za-z\s]{2,30})/i,
      /^([A-Za-z\s]{2,30})(?:\s|$)/, // If message is just a name (no numbers)
    ]
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern)
      if (match && match[1]) {
        const potentialName = match[1].trim()
        // Only accept if it looks like a name (2-30 chars, mostly letters, no phone numbers)
        if (potentialName.length >= 2 && 
            potentialName.length <= 30 && 
            /^[A-Za-z\s]+$/.test(potentialName) &&
            !/\d/.test(potentialName)) {
          info.name = potentialName
          break
        }
      }
    }
    
    return info
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || loading) return

    const lowerContent = content.toLowerCase().trim()
    const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/i.test(lowerContent)

    // Add user message first so it's visible
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Handle user info collection
    if (awaitingUserInfo) {
      const extractedInfo = extractUserInfo(content)
      
      if (awaitingUserInfo === "name" && extractedInfo.name) {
        setUserInfo((prev) => ({ ...prev, name: extractedInfo.name }))
        setAwaitingUserInfo("phone")
        
        const askingPhone: Message = {
          role: "assistant",
          content: `Nice to meet you, ${extractedInfo.name}! Could you please share your mobile number so I can assist you better?`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, askingPhone])
        return
      } else if (awaitingUserInfo === "name" && !extractedInfo.name) {
        // Still waiting for name
        const askingName: Message = {
          role: "assistant",
          content: "I'd like to know your name to personalize our conversation. What should I call you?",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, askingName])
        return
      }
      
      if (awaitingUserInfo === "phone" && extractedInfo.phone) {
        const updatedInfo = { ...userInfo, phone: extractedInfo.phone }
        setUserInfo(updatedInfo)
        setAwaitingUserInfo(null)
        
        // Save to localStorage
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(updatedInfo))
        
        const thankYou: Message = {
          role: "assistant",
          content: `Thank you, ${updatedInfo.name}! I've saved your information. How can I help you today?`,
          timestamp: new Date(),
          showQuickReplies: true,
        }
        setMessages((prev) => [...prev, thankYou])
        
        // Send user info to API to create/update lead
        try {
          await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: "user info provided",
              userInfo: updatedInfo,
            }),
          })
        } catch (e) {
          // Silent fail - lead creation is not critical for chat flow
        }
        return
      } else if (awaitingUserInfo === "phone" && !extractedInfo.phone) {
        // Still waiting for phone
        const askingPhone: Message = {
          role: "assistant",
          content: "Could you please share your mobile number? (e.g., 9876543210 or +91 9876543210)",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, askingPhone])
        return
      }
    }

    // Handle greeting - check if user info exists
    if (isGreeting && !userInfo?.name) {
      setAwaitingUserInfo("name")
      const askingName: Message = {
        role: "assistant",
        content: "Hello! I'm here to help you with college and course information. To personalize our conversation, could you please tell me your name?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, askingName])
      return
    }

    // If greeting and user info exists, greet by name
    if (isGreeting && userInfo?.name) {
      const greeting: Message = {
        role: "assistant",
        content: `Hi ${userInfo.name}! Great to see you again. How can I help you today?`,
        timestamp: new Date(),
        showQuickReplies: true,
      }
      setMessages((prev) => [...prev, greeting])
      return
    }

    // Continue with normal message flow
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
          context: {
            pathname: pathname || "",
          },
          userInfo: userInfo || undefined,
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
        // Update user info if returned from API
        if (data.userName && !userInfo?.name) {
          const updatedInfo = { ...userInfo, name: data.userName, phone: data.userPhone || userInfo?.phone }
          setUserInfo(updatedInfo)
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(updatedInfo))
        }
        
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response || data.fallback || "I'm here to help! How can I assist you today?",
          timestamp: new Date(),
          suggestions: data.suggestions || [],
          showQuickReplies: messages.length >= 2 && messages.length % 3 === 0, // Show every 3 messages
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || "Failed to get response")
      }
    } catch (error: any) {
      console.error("Chat error:", error)
      let errorMessage = "I'm sorry, I'm having trouble processing your request right now."
      
      // Check if it's a rate limit error
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
    localStorage.removeItem(STORAGE_KEY)
  }

  const handleRefresh = () => {
    handleClearChat()
    // Also reset user info if needed
    setUserInfo(null)
    setAwaitingUserInfo(null)
    localStorage.removeItem(USER_INFO_KEY)
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
      {/* Floating Button - Dynamically positioned: lower when back-to-top is hidden, higher when it's visible */}
      {!isOpen && (
        <div className={cn(
          "fixed right-4 sm:right-6 z-50 group transition-all duration-300",
          showBackToTop 
            ? "bottom-20 sm:bottom-24" // Higher position when back-to-top is visible
            : "bottom-4 sm:bottom-6"   // Lower position (same as back-to-top) when it's hidden
        )}>
          <Button
            onClick={handleToggle}
            size="lg"
            className="relative h-16 w-16 rounded-full shadow-2xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.4)] transition-all duration-300 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 touch-manipulation border-2 border-white/10 hover:border-white/20 backdrop-blur-sm hover:scale-105 active:scale-95"
            aria-label="Open chat"
          >
            {/* Pulse animation ring */}
            <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20 group-hover:opacity-30" style={{ animationDuration: '2s' }} />
            
            {/* Chat icon with AI bot indicator */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="relative">
                <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300" />
                {/* AI bot icon overlay */}
                <Bot className="absolute bottom-0 right-0 h-3.5 w-3.5 text-white bg-blue-700 rounded-full p-0.5 border border-white/30" />
              </div>
              {/* Online status indicator */}
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-blue-600 animate-pulse shadow-lg shadow-green-400/50" />
            </div>
            
            {/* Shine effect on hover */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
          
          {/* Tooltip on hover */}
          <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap transform translate-y-1 group-hover:translate-y-0">
            Chat with us
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 transition-all duration-300",
            // Mobile: full width, bottom aligned
            "bottom-0 left-0 right-0 w-full",
            // Desktop: fixed position, bottom-right
            "sm:bottom-6 sm:right-6 sm:left-auto sm:w-[380px]",
            isMinimized 
              ? "h-16" 
              : "h-[calc(100vh-4rem)] sm:h-[700px] sm:max-h-[700px]"
          )}
        >
          <Card className="flex flex-col h-full shadow-2xl border-2 border-gray-300 sm:rounded-lg overflow-hidden bg-white backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-[#18254a] via-[#1a2d5a] to-[#18254a] text-white p-3 sm:p-4 relative overflow-hidden">
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
              
              <CardTitle className="text-base sm:text-lg font-semibold relative z-10 flex items-center gap-3">
                {/* Avatar with logo */}
                <div className="relative flex items-center justify-center">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
                    <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-[#18254a] animate-pulse shadow-lg shadow-green-400/50" />
                </div>
                <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent font-bold">
                  SeeMyCampus
                </span>
              </CardTitle>
              <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  title="Refresh chat"
                  className="min-h-[44px] min-w-[44px] text-white hover:text-white hover:bg-white/20 touch-manipulation transition-all duration-200 rounded-lg"
                  aria-label="Refresh chat"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  title="Clear chat"
                  className="min-h-[44px] min-w-[44px] text-white hover:text-white hover:bg-white/20 touch-manipulation transition-all duration-200 rounded-lg"
                  aria-label="Clear chat"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Expand" : "Minimize"}
                  className="min-h-[44px] min-w-[44px] text-white hover:text-white hover:bg-white/20 touch-manipulation transition-all duration-200 rounded-lg hidden sm:flex"
                  aria-label={isMinimized ? "Expand" : "Minimize"}
                >
                  <Minimize2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  title="Close"
                  className="min-h-[44px] min-w-[44px] text-white hover:text-white hover:bg-white/20 touch-manipulation transition-all duration-200 rounded-lg"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            {!isMinimized && (
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
                
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative z-10">
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
                <div className="border-t-2 border-gray-300 bg-white p-4 sm:p-5 space-y-3 relative z-10">
                  <ChatInput onSend={handleSendMessage} disabled={loading} />
                  {/* Footer branding */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#18254a] to-[#1a2d5a] flex items-center justify-center shadow-sm">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">SeeMyCampus</span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Powered by AI</span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  )
}

