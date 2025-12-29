import { SYSTEM_PROMPT, checkSafety } from "./prompts"
import { CustomAIProvider } from "./providers/custom"
import { OpenAIProvider } from "./providers/openai"
import type { AIProvider } from "./providers/base"
import { getAllColleges } from "@/lib/colleges"
import { db } from "@/db"
import { colleges, courses } from "@/db/schema"
import { ilike, or } from "drizzle-orm"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
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

export class Chatbot {
  private provider: AIProvider
  private conversationHistory: ChatMessage[] = []

  constructor() {
    const providerType = process.env.AI_PROVIDER || "custom"

    if (providerType === "openai") {
      this.provider = new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      })
    } else {
      this.provider = new CustomAIProvider({
        apiKey: process.env.AI_API_KEY,
        apiUrl: process.env.AI_API_URL,
        model: process.env.AI_MODEL || "default",
      })
    }
  }

  /**
   * Check if AI provider is properly configured
   */
  isConfigured(): boolean {
    const providerType = process.env.AI_PROVIDER || "custom"
    
    if (providerType === "openai") {
      return !!process.env.OPENAI_API_KEY
    } else {
      return !!(process.env.AI_API_URL && process.env.AI_API_KEY)
    }
  }

  /**
   * Search for colleges based on user query
   */
  async searchColleges(query: string): Promise<CollegeSuggestion[]> {
    try {
      // Extract keywords from query
      const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2)
      
      if (keywords.length === 0) {
        return []
      }

      // Build search conditions - match any keyword in any field
      const conditions = keywords.flatMap(keyword => [
        ilike(colleges.name, `%${keyword}%`),
        ilike(colleges.location, `%${keyword}%`),
        ilike(colleges.city, `%${keyword}%`),
        ilike(colleges.description, `%${keyword}%`)
      ])

      // Search colleges by name, location, city, or description
      const results = await db
        .select({
          id: colleges.id,
          name: colleges.name,
          slug: colleges.slug,
          location: colleges.location,
          city: colleges.city,
          description: colleges.description,
          ranking: colleges.ranking,
        })
        .from(colleges)
        .where(or(...conditions))
        .limit(5)

      return results
    } catch (error) {
      console.error("College search error:", error)
      return []
    }
  }

  async sendMessage(
    userMessage: string,
    includeColleges: boolean = true,
    history?: ChatMessage[]
  ): Promise<{ response: string; suggestions: CollegeSuggestion[] }> {
    // Extract context from message if present (format: [Context] actual message)
    let contextInfo = ""
    let actualMessage = userMessage
    
    if (userMessage.startsWith("[") && userMessage.includes("]")) {
      const contextMatch = userMessage.match(/^\[([^\]]+)\]\s*(.+)$/s)
      if (contextMatch) {
        contextInfo = contextMatch[1]
        actualMessage = contextMatch[2].trim()
      }
    }

    // Safety check on actual message
    if (!checkSafety(actualMessage)) {
      return {
        response: "I'm here to help with educational questions about colleges and courses. For personal, financial, medical, or legal advice, please consult with appropriate professionals.",
        suggestions: []
      }
    }

    // Restore history if provided (for session management)
    if (history && history.length > 0) {
      this.conversationHistory = [...history]
    }

    // Search for relevant colleges if enabled
    let collegeSuggestions: CollegeSuggestion[] = []
    let collegeContext = ""
    
    if (includeColleges) {
      collegeSuggestions = await this.searchColleges(actualMessage)
      
      if (collegeSuggestions.length > 0) {
        collegeContext = `\n\nRelevant colleges in our database:\n${collegeSuggestions.map((college, idx) => 
          `${idx + 1}. ${college.name}${college.city ? ` (${college.city})` : ""}${college.ranking ? ` - Rank: ${college.ranking}` : ""}${college.description ? ` - ${college.description.substring(0, 100)}...` : ""}`
        ).join("\n")}\n\nWhen mentioning these colleges, encourage students to visit /colleges/${collegeSuggestions[0].slug} for more details.`
      }
    }

    // Build context-aware prompt
    let contextPrompt = ""
    if (contextInfo) {
      if (contextInfo.includes("viewing college")) {
        const collegeSlug = contextInfo.split("college: ")[1]
        contextPrompt = `\n\nIMPORTANT CONTEXT: The user is currently viewing a specific college page (${collegeSlug}). They may be asking questions about this college specifically. Reference this context naturally in your response.`
      } else if (contextInfo.includes("browsing colleges")) {
        contextPrompt = `\n\nIMPORTANT CONTEXT: The user is currently browsing the colleges listing page. They may be looking for colleges to explore.`
      } else if (contextInfo.includes("browsing courses")) {
        contextPrompt = `\n\nIMPORTANT CONTEXT: The user is currently browsing courses. They may be interested in specific programs or course requirements.`
      } else if (contextInfo.includes("browsing scholarships")) {
        contextPrompt = `\n\nIMPORTANT CONTEXT: The user is currently browsing scholarships. They may be interested in financial aid or scholarship opportunities.`
      }
    }

    // Add user message to history (use actual message without context prefix)
    this.conversationHistory.push({
      role: "user",
      content: actualMessage,
    })

    // Check if AI is configured before attempting to use it
    if (!this.isConfigured()) {
      console.warn("AI provider not configured. Using intelligent fallback response.")
      
      // Provide helpful fallback response based on message content
      const lowerMessage = actualMessage.toLowerCase().trim()
      let fallbackResponse = ""
      
      // Handle greetings - this will be handled by frontend, but provide fallback
      if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/)) {
        fallbackResponse = "Hello! I'm here to help you with college and course information. I can assist you with:\n\n• Finding the right colleges and courses\n• Understanding admission requirements\n• Exploring scholarship opportunities\n• Career counseling guidance\n• Fee calculations\n\nWhat would you like to know?"
      }
      // Handle college-related queries
      else if (lowerMessage.includes("college") || lowerMessage.includes("colleges") || lowerMessage.includes("university") || lowerMessage.includes("institute")) {
        if (collegeSuggestions.length > 0) {
          fallbackResponse = `I found ${collegeSuggestions.length} college${collegeSuggestions.length > 1 ? 's' : ''} that match your search! You can:\n\n• Browse our complete college listings at /colleges\n• Compare colleges side-by-side\n• View detailed information about programs, fees, and admission requirements\n• Check out college reviews and rankings\n\nWould you like to explore these colleges?`
        } else {
          fallbackResponse = "I can help you find colleges! You can:\n\n• Browse our college listings to explore options\n• Use filters to find colleges by location, courses, or rankings\n• Compare colleges side-by-side\n• View detailed information about programs, fees, and admission requirements\n\nVisit our colleges page to get started!"
        }
      }
      // Handle course-related queries
      else if (lowerMessage.includes("course") || lowerMessage.includes("program") || lowerMessage.includes("degree") || lowerMessage.includes("major")) {
        fallbackResponse = "I can help you explore courses and programs! You can:\n\n• Browse our courses page to find programs that match your interests\n• Filter courses by category (Engineering, Medical, MBA, etc.)\n• Check course requirements and prerequisites\n• See which colleges offer your preferred courses\n• Understand career prospects for different programs\n\nVisit our courses page to explore options!"
      }
      // Handle scholarship/fee queries
      else if (lowerMessage.includes("scholarship") || lowerMessage.includes("financial aid") || lowerMessage.includes("funding")) {
        fallbackResponse = "I can help you with scholarships and financial aid! You can:\n\n• Browse our scholarships page for available opportunities\n• Filter scholarships by category, level, and eligibility\n• Check application deadlines and requirements\n• View college-specific scholarships\n• Use our fee calculator to estimate costs\n\nVisit our scholarships page to explore funding options!"
      }
      // Handle fee/cost queries
      else if (lowerMessage.includes("fee") || lowerMessage.includes("cost") || lowerMessage.includes("price") || lowerMessage.includes("tuition")) {
        fallbackResponse = "I can help you understand college fees and costs! You can:\n\n• Use our fee calculator to estimate total costs\n• View detailed fee breakdowns on college pages\n• Compare fees across different colleges\n• Calculate costs including tuition, hostel, mess, and other expenses\n• Factor in scholarships and discounts\n\nTry our fee calculator or visit college pages for detailed fee information!"
      }
      // Handle admission queries
      else if (lowerMessage.includes("admission") || lowerMessage.includes("apply") || lowerMessage.includes("application") || lowerMessage.includes("entrance exam")) {
        fallbackResponse = "I can help you with admissions! You can:\n\n• View admission requirements on each college's page\n• Check entrance exam requirements (JEE, NEET, CAT, etc.)\• See application deadlines and processes\n• Understand eligibility criteria\n• View our entrance exams timeline for important dates\n\nVisit our colleges page or entrance exams page for detailed admission information!"
      }
      // Handle career queries
      else if (lowerMessage.includes("career") || lowerMessage.includes("job") || lowerMessage.includes("placement") || lowerMessage.includes("salary")) {
        fallbackResponse = "I can help you with career guidance! You can:\n\n• Explore career counseling services\n• Check placement statistics on college pages\n• Understand career prospects for different courses\n• Get guidance on choosing the right career path\n• View our career counseling page for expert advice\n\nVisit our career counseling page or explore college pages for placement information!"
      }
      // Handle location queries
      else if (lowerMessage.includes("location") || lowerMessage.includes("city") || lowerMessage.includes("where") || lowerMessage.match(/\b(delhi|mumbai|bangalore|pune|hyderabad|chennai|kolkata)\b/)) {
        fallbackResponse = "I can help you find colleges by location! You can:\n\n• Browse colleges and filter by city or state\n• Search for colleges in specific locations\n• View location details on each college page\n• Compare colleges in different cities\n\nUse the location filter on our colleges page to find colleges near you!"
      }
      // Handle ranking queries
      else if (lowerMessage.includes("rank") || lowerMessage.includes("best") || lowerMessage.includes("top") || lowerMessage.includes("ranking")) {
        fallbackResponse = "I can help you find top-ranked colleges! You can:\n\n• Browse colleges sorted by rankings\n• View ranking information on each college page\n• Compare rankings across different colleges\n• Filter colleges by ranking criteria\n\nVisit our colleges page and use the ranking filter to find top colleges!"
      }
      // Default helpful response
      else {
        fallbackResponse = "I'm here to help you with college and course information! I can assist you with:\n\n• Finding the right colleges and courses\n• Understanding admission requirements\n• Exploring scholarship opportunities\n• Career counseling guidance\n• Fee calculations and cost estimates\n• Comparing colleges\n\nTry asking me about:\n• \"Show me engineering colleges\"\n• \"What are the admission requirements?\"\n• \"Tell me about scholarships\"\n• \"Help me calculate fees\"\n\nOr browse our website to explore colleges, courses, and more!"
      }
      
      // Add college suggestions if found
      if (collegeSuggestions.length > 0) {
        fallbackResponse += `\n\n💡 I found ${collegeSuggestions.length} college${collegeSuggestions.length > 1 ? 's' : ''} that might interest you - check them out below!`
      }
      
      // Add assistant response to history for context
      this.conversationHistory.push({
        role: "assistant",
        content: fallbackResponse,
      })
      
      return {
        response: fallbackResponse,
        suggestions: collegeSuggestions
      }
    }

    try {
      // Build enhanced system prompt with college context and page context
      const enhancedSystemPrompt = SYSTEM_PROMPT + contextPrompt + collegeContext

      // Build messages array with system prompt
      const messages = [
        { role: "system" as const, content: enhancedSystemPrompt },
        ...this.conversationHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ]

      // Get AI response with timeout handling
      const response = await Promise.race([
        this.provider.chat(messages),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 30000)
        ),
      ]) as string

      // Add assistant response to history
      this.conversationHistory.push({
        role: "assistant",
        content: response,
      })

      return {
        response,
        suggestions: collegeSuggestions
      }
    } catch (error: any) {
      console.error("Chatbot error:", error)
      
      // Provide more specific error messages
      if (error.message?.includes("timeout")) {
        return {
          response: "I'm taking longer than usual to respond. This might be due to high demand. Please try again in a moment, or feel free to browse our college listings directly while you wait.",
          suggestions: collegeSuggestions
        }
      }

      if (error.message?.includes("API key") || error.message?.includes("unauthorized") || error.message?.includes("not configured")) {
        // Fallback to helpful response when API is not configured
        const lowerMessage = actualMessage.toLowerCase()
        let fallbackResponse = "I'm currently being set up, but I can still help you! "
        
        if (lowerMessage.includes("college") || lowerMessage.includes("colleges")) {
          fallbackResponse += "You can browse our college listings to find the perfect match. Visit our colleges page to explore options."
        } else if (lowerMessage.includes("course") || lowerMessage.includes("program")) {
          fallbackResponse += "You can explore our courses page to find programs that match your interests."
        } else if (lowerMessage.includes("scholarship") || lowerMessage.includes("fee")) {
          fallbackResponse += "Check out our scholarships page for financial aid opportunities, or use our fee calculator."
        } else {
          fallbackResponse += "Browse our website to explore colleges, courses, scholarships, and more. You can also try asking me a more specific question!"
        }
        
        if (collegeSuggestions.length > 0) {
          fallbackResponse += `\n\nI found ${collegeSuggestions.length} college${collegeSuggestions.length > 1 ? 's' : ''} that might interest you!`
        }
        
        return {
          response: fallbackResponse,
          suggestions: collegeSuggestions
        }
      }

      // Generic fallback with helpful suggestions
      let fallbackResponse = "I'm having trouble processing your request right now. "
      if (collegeSuggestions.length > 0) {
        fallbackResponse += `However, I found ${collegeSuggestions.length} college${collegeSuggestions.length > 1 ? 's' : ''} that might interest you. `
      }
      fallbackResponse += "You can:\n• Try asking your question again\n• Browse our college listings\n• Check out our courses and scholarships\n• Contact our support team"
      
      return {
        response: fallbackResponse,
        suggestions: collegeSuggestions
      }
    }
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  clearHistory(): void {
    this.conversationHistory = []
  }
}


