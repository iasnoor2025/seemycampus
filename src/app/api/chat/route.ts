import { NextRequest, NextResponse } from "next/server"
import { Chatbot } from "@/lib/ai/chatbot"
import type { ChatMessage } from "@/lib/ai/chatbot"
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit"
import { createLead } from "@/lib/leads/capture"
import { db } from "@/db"
import { leads, faqs } from "@/db/schema"
import { eq, or } from "drizzle-orm"
import { updateAIFromConversations } from "@/lib/ai/training"

export async function POST(request: NextRequest) {
  let message: string = ""
  
  try {
    // Parse body early so it's accessible in catch block
    let body: any = {}
    try {
      body = await request.json()
      message = body.message || ""
    } catch (parseError) {
      // If JSON parsing fails, we'll handle it below
    }

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

    const { clearHistory, includeColleges, history, context, userInfo } = body

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

    // Handle user info collection (name and phone) - only save lead when BOTH are provided
    let userName: string | null = null
    let userPhone: string | null = null
    let hasQuizData = false
    
    // Only create/update lead when BOTH name and phone are provided
    if (userInfo && userInfo.name && userInfo.phone) {
      try {
        // Check if lead already exists by phone
          const existingLeads = await db
            .select()
            .from(leads)
          .where(eq(leads.phone, userInfo.phone))
            .limit(1)

          if (existingLeads.length > 0) {
          // Update existing lead with name if it was anonymous
            const existingLead = existingLeads[0]
          if (existingLead.name === "Anonymous" || !existingLead.name) {
            await db
              .update(leads)
              .set({
                name: userInfo.name,
                updatedAt: new Date(),
              })
              .where(eq(leads.id, existingLead.id))
          }
          userName = existingLead.name !== "Anonymous" ? existingLead.name : userInfo.name
          userPhone = existingLead.phone || userInfo.phone
            hasQuizData = !!existingLead.quizData || !!existingLead.studentAnswerId
          } else {
          // Create new lead with chat as source - both name and phone are required
          const newLead = await createLead({
            name: userInfo.name,
            email: userInfo.email || `chat_${Date.now()}@seemycampus.com`,
            phone: userInfo.phone,
            source: "chat",
            phoneVerified: false,
          })
          userName = newLead.name
          userPhone = newLead.phone
          hasQuizData = !!newLead.quizData || !!newLead.studentAnswerId
          console.log(`Lead created from chat: ${newLead.id} - ${newLead.name} - ${newLead.phone}`)
        }
      } catch (error) {
        console.error("Error creating/updating lead from chat:", error)
        // Continue without failing - user info is optional
      }
    } else if (userInfo && userInfo.name) {
      // Only name provided - don't create lead yet, wait for phone
      userName = userInfo.name
    } else if (userInfo && userInfo.phone) {
      // Only phone provided - don't create lead yet, wait for name
      userPhone = userInfo.phone
    }

    // Create a new chatbot instance for each request using database config
    let chatbot: Chatbot
    try {
      chatbot = await Chatbot.create()
    } catch (error) {
      console.warn("Failed to create chatbot with database config, falling back to env vars:", error)
      chatbot = new Chatbot() // Fallback to legacy constructor
    }

    // Check if AI is configured (will use fallback if not)
    const isConfigured = await chatbot.isConfigured()
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

      // Save FAQ to database (only for meaningful Q&A, not greetings or user info collection)
      if (finalResponse && 
          !lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/) &&
          !lowerMessage.includes("my name is") &&
          !lowerMessage.match(/^\d{10}$/) && // Not just a phone number
          !lowerMessage.includes("user info provided") && // Not system messages
          finalResponse.length > 20) { // Meaningful answer
        try {
          // Determine category based on question
          let category = "general"
          if (lowerMessage.includes("admission") || lowerMessage.includes("apply") || lowerMessage.includes("entrance")) {
            category = "admission"
          } else if (lowerMessage.includes("fee") || lowerMessage.includes("cost") || lowerMessage.includes("tuition")) {
            category = "fees"
          } else if (lowerMessage.includes("course") || lowerMessage.includes("program") || lowerMessage.includes("degree")) {
            category = "courses"
          } else if (lowerMessage.includes("college") || lowerMessage.includes("university") || lowerMessage.includes("institute")) {
            category = "colleges"
          } else if (lowerMessage.includes("scholarship") || lowerMessage.includes("financial")) {
            category = "scholarships"
          }

          // Check if FAQ with similar question already exists
          const normalizedQuestion = message.toLowerCase().trim()
          const existingFaqs = await db
            .select()
            .from(faqs)
            .where(eq(faqs.isActive, true))
            .limit(100)

          const existingFaq = existingFaqs.find(faq => 
            faq.question.toLowerCase().trim() === normalizedQuestion
          )

          if (existingFaq) {
            // Update existing FAQ - increment view count
            await db
              .update(faqs)
              .set({
                viewCount: (existingFaq.viewCount || 0) + 1,
                updatedAt: new Date(),
              })
              .where(eq(faqs.id, existingFaq.id))
          } else {
            // Create new FAQ
            await db
              .insert(faqs)
              .values({
                question: message.trim(),
                answer: finalResponse.trim(),
                category: category,
                source: "chat",
                viewCount: 1,
                isActive: true,
                displayOrder: 0,
              })
          }
        } catch (error) {
          // Silent fail - FAQ saving is not critical
          console.error("Error saving FAQ:", error)
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
      
      // The chatbot.sendMessage should return a response even on error (with fallback)
      // But if it throws, we'll provide a helpful response
      let errorResponse = chatbotError.response
      let errorSuggestions = chatbotError.suggestions || []
      
      // If no response from chatbot error, create a helpful one based on the message
      if (!errorResponse) {
        const lowerMessage = message.toLowerCase().trim()
        
        if (lowerMessage.includes("college") || lowerMessage.includes("colleges") || lowerMessage.includes("university")) {
          errorResponse = "I can help you find colleges. Browse our college listings for options and details."
        } else if (lowerMessage.includes("course") || lowerMessage.includes("program") || lowerMessage.includes("degree")) {
          errorResponse = "I can help with courses. Visit our courses page to find programs."
        } else if (lowerMessage.includes("scholarship") || lowerMessage.includes("financial aid")) {
          errorResponse = "I can help with scholarships. Check our scholarships page."
        } else if (lowerMessage.includes("fee") || lowerMessage.includes("cost") || lowerMessage.includes("tuition")) {
          errorResponse = "I can help with fees. Use our fee calculator or visit college pages."
        } else if (lowerMessage.includes("admission") || lowerMessage.includes("apply") || lowerMessage.includes("entrance exam")) {
          errorResponse = "I can help with admissions. Visit our colleges or entrance exams pages."
        } else {
          errorResponse = "How can I help you?"
        }
        
        // Try to get college suggestions even on error
        try {
          let chatbot: Chatbot
          try {
            chatbot = await Chatbot.create()
          } catch (error) {
            chatbot = new Chatbot() // Fallback to legacy constructor
          }
          const searchResult = await chatbot.searchColleges(message || "")
          errorSuggestions = searchResult || []
          if (errorSuggestions.length > 0) {
            errorResponse += `\n\n💡 I found ${errorSuggestions.length} college${errorSuggestions.length > 1 ? 's' : ''} that might interest you!`
          }
        } catch (e) {
          // Ignore search errors
        }
      }
      
      return NextResponse.json({
        response: errorResponse,
        suggestions: errorSuggestions,
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
    let helpfulResponse = "I'm here to help! "
    
    // Provide context-aware response based on the message
    const lowerMessage = (message || "").toLowerCase().trim()
    
    if (lowerMessage.includes("college") || lowerMessage.includes("colleges") || lowerMessage.includes("university")) {
      helpfulResponse += "Browse our college listings for options and details."
    } else if (lowerMessage.includes("course") || lowerMessage.includes("program") || lowerMessage.includes("degree")) {
      helpfulResponse += "Visit our courses page to find programs."
    } else if (lowerMessage.includes("scholarship") || lowerMessage.includes("financial aid")) {
      helpfulResponse += "Check our scholarships page."
    } else if (lowerMessage.includes("fee") || lowerMessage.includes("cost") || lowerMessage.includes("tuition")) {
      helpfulResponse += "Use our fee calculator or visit college pages."
    } else if (lowerMessage.includes("admission") || lowerMessage.includes("apply") || lowerMessage.includes("entrance exam")) {
      helpfulResponse += "Visit our colleges or entrance exams pages."
    } else {
      helpfulResponse += "How can I help you?"
    }
    
    try {
      let chatbot: Chatbot
      try {
        chatbot = await Chatbot.create()
      } catch (error) {
        chatbot = new Chatbot() // Fallback to legacy constructor
      }
      const searchResult = await chatbot.searchColleges(message || "")
      suggestions = searchResult || []
      if (suggestions.length > 0) {
        helpfulResponse += `\n\n💡 I found ${suggestions.length} college${suggestions.length > 1 ? 's' : ''} that might interest you!`
      }
    } catch (e) {
      // Ignore search errors
    }

    return NextResponse.json(
      {
        response: helpfulResponse,
        suggestions: suggestions,
        success: true, // Return success so UI doesn't show error
      },
      { status: 200 } // Return 200 so frontend treats it as success
    )
  }
}

