import { NextRequest, NextResponse } from "next/server"
import { Chatbot } from "@/lib/ai/chatbot"
import type { ChatMessage } from "@/lib/ai/chatbot"
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit"
import { createLead } from "@/lib/leads/capture"
import { db } from "@/db"
import { leads } from "@/db/schema"
import { eq, or } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - check both per-minute and per-hour limits
    const clientIP = getClientIP(request)
    
    const minuteLimit = checkRateLimit(clientIP, RATE_LIMITS.PER_MINUTE)
    if (!minuteLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait a moment before trying again.",
          retryAfter: minuteLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(minuteLimit.retryAfter || 60),
            "X-RateLimit-Limit": String(RATE_LIMITS.PER_MINUTE.maxRequests),
            "X-RateLimit-Remaining": String(minuteLimit.remaining),
            "X-RateLimit-Reset": String(minuteLimit.resetTime),
          },
        }
      )
    }

    const hourLimit = checkRateLimit(clientIP, RATE_LIMITS.PER_HOUR)
    if (!hourLimit.allowed) {
      return NextResponse.json(
        {
          error: "Hourly request limit exceeded. Please try again later.",
          retryAfter: hourLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(hourLimit.retryAfter || 3600),
            "X-RateLimit-Limit": String(RATE_LIMITS.PER_HOUR.maxRequests),
            "X-RateLimit-Remaining": String(hourLimit.remaining),
            "X-RateLimit-Reset": String(hourLimit.resetTime),
          },
        }
      )
    }

    const body = await request.json()
    const { message, clearHistory, includeColleges, history, context, userInfo } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Validate message length
    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message is too long. Please keep it under 2000 characters." },
        { status: 400 }
      )
    }

    // Handle user info collection (name and phone)
    let userName: string | null = null
    let userPhone: string | null = null
    let hasQuizData = false
    
    if (userInfo && (userInfo.name || userInfo.phone || userInfo.email)) {
      try {
        // Check if user info already exists in database by phone or email
        if (userInfo.phone || userInfo.email) {
          const existingLeads = await db
            .select()
            .from(leads)
            .where(
              userInfo.phone && userInfo.email
                ? or(eq(leads.phone, userInfo.phone), eq(leads.email, userInfo.email))
                : userInfo.phone
                ? eq(leads.phone, userInfo.phone)
                : eq(leads.email, userInfo.email)
            )
            .limit(1)

          if (existingLeads.length > 0) {
            const existingLead = existingLeads[0]
            userName = existingLead.name !== "Anonymous" ? existingLead.name : (userInfo.name || null)
            userPhone = existingLead.phone || userInfo.phone || null
            hasQuizData = !!existingLead.quizData || !!existingLead.studentAnswerId
          } else {
            // Create new lead with chat as source
            const newLead = await createLead({
              name: userInfo.name || "Anonymous",
              email: userInfo.email || `chat_${Date.now()}@seemycampus.com`,
              phone: userInfo.phone || undefined,
              source: "chat",
              phoneVerified: false,
            })
            userName = newLead.name !== "Anonymous" ? newLead.name : null
            userPhone = newLead.phone || null
            hasQuizData = !!newLead.quizData || !!newLead.studentAnswerId
          }
        } else if (userInfo.name) {
          // Only name provided, create lead without phone
          const newLead = await createLead({
            name: userInfo.name,
            email: `chat_${Date.now()}@seemycampus.com`,
            phone: undefined,
            source: "chat",
            phoneVerified: false,
          })
          userName = newLead.name !== "Anonymous" ? newLead.name : null
          hasQuizData = !!newLead.quizData || !!newLead.studentAnswerId
        }
      } catch (error) {
        console.error("Error handling user info from chat:", error)
        // Continue without failing - user info is optional
      }
    }

    // Create a new chatbot instance for each request
    const chatbot = new Chatbot()

    // Check if AI is configured (will use fallback if not)
    const isConfigured = chatbot.isConfigured()
    if (!isConfigured) {
      console.warn("AI provider not configured. Chatbot will use fallback responses.")
    }

    if (clearHistory) {
      chatbot.clearHistory()
    }

    // Build context-aware message if context is provided
    let enhancedMessage = message
    if (context?.pathname) {
      const pathname = context.pathname
      if (pathname.startsWith("/colleges/")) {
        // Extract college slug from pathname
        const slug = pathname.split("/colleges/")[1]?.split("/")[0]
        if (slug) {
          enhancedMessage = `[User is viewing college: ${slug}] ${message}`
        }
      } else if (pathname.startsWith("/colleges")) {
        enhancedMessage = `[User is browsing colleges page] ${message}`
      } else if (pathname.startsWith("/courses")) {
        enhancedMessage = `[User is browsing courses] ${message}`
      } else if (pathname.startsWith("/scholarships")) {
        enhancedMessage = `[User is browsing scholarships] ${message}`
      }
    }

    let result
    try {
      if (history && Array.isArray(history)) {
        // Restore conversation history if provided
        const chatHistory: ChatMessage[] = history.map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))
        
        result = await chatbot.sendMessage(
          enhancedMessage,
          includeColleges !== false,
          chatHistory
        )
      } else {
        result = await chatbot.sendMessage(enhancedMessage, includeColleges !== false)
      }

      // Enhance greeting response if user name is available
      let finalResponse = result.response
      const lowerMessage = message.toLowerCase().trim()
      if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/) && userName) {
        // Replace generic greeting with personalized one if not already personalized
        if (!result.response.includes(userName)) {
          finalResponse = `Hi ${userName}! ${result.response.replace(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)[!.,]?\s*/i, '')}`
        }
      }

      return NextResponse.json({
        response: finalResponse,
        suggestions: result.suggestions || [],
        success: true,
        userName: userName, // Return user name if found/created
        userPhone: userPhone, // Return user phone if found/created
        hasQuizData: hasQuizData, // Indicate if user has filled quiz
      }, {
        headers: {
          "X-RateLimit-Limit-Minute": String(RATE_LIMITS.PER_MINUTE.maxRequests),
          "X-RateLimit-Remaining-Minute": String(minuteLimit.remaining),
          "X-RateLimit-Limit-Hour": String(RATE_LIMITS.PER_HOUR.maxRequests),
          "X-RateLimit-Remaining-Hour": String(hourLimit.remaining),
        },
      })
    } catch (chatbotError: any) {
      // If chatbot.sendMessage throws an error, handle it gracefully
      console.error("Error in chatbot.sendMessage:", chatbotError)
      
      // Return a helpful response even if chatbot fails
      return NextResponse.json({
        response: chatbotError.response || "I'm having trouble right now, but I can still help! You can browse our college listings, explore courses, check out scholarships, or contact our support team for assistance.",
        suggestions: chatbotError.suggestions || [],
        success: true, // Still return success so UI doesn't show error state
      }, {
        headers: {
          "X-RateLimit-Limit-Minute": String(RATE_LIMITS.PER_MINUTE.maxRequests),
          "X-RateLimit-Remaining-Minute": String(minuteLimit.remaining),
          "X-RateLimit-Limit-Hour": String(RATE_LIMITS.PER_HOUR.maxRequests),
          "X-RateLimit-Remaining-Hour": String(hourLimit.remaining),
        },
      })
    }
  } catch (error: any) {
    console.error("Chat API error:", error)
    
    // Handle specific error types
    if (error.message?.includes("API key") || error.message?.includes("API")) {
      return NextResponse.json(
        {
          error: "AI service is temporarily unavailable. Please try again later or contact support.",
          success: false,
        },
        { status: 503 }
      )
    }

    if (error.message?.includes("timeout") || error.message?.includes("network")) {
      return NextResponse.json(
        {
          error: "Request timed out. Please try again.",
          success: false,
        },
        { status: 504 }
      )
    }

    // Generic error response with helpful fallback - still return success so UI works
    // Try to get college suggestions even on error
    let suggestions: any[] = []
    try {
      const chatbot = new Chatbot()
      const searchResult = await chatbot.searchColleges(body?.message || "")
      suggestions = searchResult || []
    } catch (e) {
      // Ignore search errors
    }

    return NextResponse.json(
      {
        response: "I'm having trouble processing your request right now, but I can still help! You can:\n\n• Browse our college listings to find options\n• Explore courses and programs\n• Check out scholarship opportunities\n• Use our fee calculator\n• Contact our support team\n\nOr try asking me a more specific question about colleges, courses, or admissions!",
        suggestions: suggestions,
        success: true, // Return success so UI doesn't show error
      },
      { status: 200 } // Return 200 so frontend treats it as success
    )
  }
}

