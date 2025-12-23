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

  async sendMessage(userMessage: string, includeColleges: boolean = true): Promise<{ response: string; suggestions: CollegeSuggestion[] }> {
    // Safety check
    if (!checkSafety(userMessage)) {
      return {
        response: "I'm here to help with educational questions about colleges and courses. For personal, financial, medical, or legal advice, please consult with appropriate professionals.",
        suggestions: []
      }
    }

    // Search for relevant colleges if enabled
    let collegeSuggestions: CollegeSuggestion[] = []
    let collegeContext = ""
    
    if (includeColleges) {
      collegeSuggestions = await this.searchColleges(userMessage)
      
      if (collegeSuggestions.length > 0) {
        collegeContext = `\n\nRelevant colleges in our database:\n${collegeSuggestions.map((college, idx) => 
          `${idx + 1}. ${college.name}${college.city ? ` (${college.city})` : ""}${college.ranking ? ` - Rank: ${college.ranking}` : ""}${college.description ? ` - ${college.description.substring(0, 100)}...` : ""}`
        ).join("\n")}\n\nWhen mentioning these colleges, encourage students to visit /colleges/${collegeSuggestions[0].slug} for more details.`
      }
    }

    // Add user message to history
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    })

    try {
      // Build enhanced system prompt with college context
      const enhancedSystemPrompt = SYSTEM_PROMPT + collegeContext

      // Build messages array with system prompt
      const messages = [
        { role: "system" as const, content: enhancedSystemPrompt },
        ...this.conversationHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ]

      // Get AI response
      const response = await this.provider.chat(messages)

      // Add assistant response to history
      this.conversationHistory.push({
        role: "assistant",
        content: response,
      })

      return {
        response,
        suggestions: collegeSuggestions
      }
    } catch (error) {
      console.error("Chatbot error:", error)
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact our support team.",
        suggestions: []
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

