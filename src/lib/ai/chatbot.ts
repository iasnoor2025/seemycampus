import { SYSTEM_PROMPT, BASE_SYSTEM_PROMPT, checkSafety } from "./prompts"
import { generateEnhancedSystemPrompt } from "./training"
import { CustomAIProvider } from "./providers/custom"
import { OpenAIProvider } from "./providers/openai"
import { OpenRouterProvider } from "./providers/openrouter"
import { OllamaProvider } from "./providers/ollama"
import type { AIProvider } from "./providers/base"
import { getAIConfig } from "./config"
import { getAllColleges } from "@/lib/colleges"
import { db } from "@/db"
import { colleges, courses } from "@/db/schema"
import { ilike, or, eq, and, asc, desc } from "drizzle-orm"
import { searchWeb, searchCollegeInfo, extractCollegeDataFromWeb } from "@/lib/web/search"
import { saveAndEnrichCollegeFromWeb } from "./enrichCollege"

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

  constructor(provider?: AIProvider) {
    // If provider is passed, use it (for async initialization)
    // Otherwise, use legacy env var initialization (for backward compatibility)
    if (provider) {
      this.provider = provider
    } else {
      // Legacy initialization from environment variables
      const providerType = process.env.AI_PROVIDER || "custom"

      if (providerType === "ollama") {
        this.provider = new OllamaProvider({
          apiUrl: process.env.OLLAMA_API_URL || "http://localhost:11434",
          model: process.env.OLLAMA_MODEL || "llama3.2:latest",
        })
      } else if (providerType === "openrouter") {
        this.provider = new OpenRouterProvider({
          apiKey: process.env.OPENROUTER_API_KEY,
          model: process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo",
        })
      } else if (providerType === "openai") {
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
  }

  /**
   * Create a Chatbot instance with database config
   * This is the preferred method as it uses database settings
   */
  static async create(): Promise<Chatbot> {
    const config = await getAIConfig()
    let provider: AIProvider

    if (config.providerType === "ollama") {
      provider = new OllamaProvider({
        apiUrl: config.ollamaApiUrl || "http://localhost:11434",
        model: config.ollamaModel || "llama3.2:latest",
      })
    } else if (config.providerType === "openrouter") {
      if (!config.openrouterApiKey) {
        throw new Error("OpenRouter API key is not configured")
      }
      provider = new OpenRouterProvider({
        apiKey: config.openrouterApiKey,
        model: config.openrouterModel || "openai/gpt-3.5-turbo",
      })
    } else if (config.providerType === "openai") {
      if (!config.openaiApiKey) {
        throw new Error("OpenAI API key is not configured")
      }
      provider = new OpenAIProvider({
        apiKey: config.openaiApiKey,
        model: config.openaiModel || "gpt-3.5-turbo",
      })
    } else {
      if (!config.customApiKey || !config.customApiUrl) {
        throw new Error("Custom AI API key and URL are required")
      }
      provider = new CustomAIProvider({
        apiKey: config.customApiKey,
        apiUrl: config.customApiUrl,
        model: config.customModel || "default",
      })
    }

    return new Chatbot(provider)
  }

  /**
   * Check if AI provider is properly configured
   */
  async isConfigured(): Promise<boolean> {
    try {
      const config = await getAIConfig()
      const providerType = config.providerType
      
      if (providerType === "ollama") {
        return true // Ollama is configured if URL is set
      } else if (providerType === "openrouter") {
        return !!config.openrouterApiKey
      } else if (providerType === "openai") {
        return !!config.openaiApiKey
      } else {
        return !!(config.customApiUrl && config.customApiKey)
      }
    } catch (error) {
      // Fallback to environment variables
      const providerType = process.env.AI_PROVIDER || "custom"
      
      if (providerType === "ollama") {
        return true
      } else if (providerType === "openrouter") {
        return !!process.env.OPENROUTER_API_KEY
      } else if (providerType === "openai") {
        return !!process.env.OPENAI_API_KEY
      } else {
        return !!(process.env.AI_API_URL && process.env.AI_API_KEY)
      }
    }
  }

  /**
   * Detect college name from user query (e.g., "JMI", "Jamia Millia Islamia")
   */
  async detectCollegeFromQuery(query: string): Promise<CollegeSuggestion | null> {
    try {
      // Common college abbreviations and their full names
      const collegeAbbreviations: Record<string, string> = {
        "jmi": "Jamia Millia Islamia",
        "du": "Delhi University",
        "jnu": "Jawaharlal Nehru University",
        "iit": "Indian Institute of Technology",
        "nit": "National Institute of Technology",
        "iim": "Indian Institute of Management",
        "aiims": "All India Institute of Medical Sciences",
      }

      const lowerQuery = query.toLowerCase().trim()
      
      // Check for abbreviations first
      for (const [abbr, fullName] of Object.entries(collegeAbbreviations)) {
        if (lowerQuery.includes(abbr) && abbr.length >= 3) {
          const result = await this.searchColleges(fullName)
          if (result.length > 0) {
            return result[0] // Return first match
          }
        }
      }

      // Try to extract college name from query (look for patterns like "tell me about X", "what is X", etc.)
      const patterns = [
        /(?:tell me about|what is|about|information about|details about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:University|College|Institute|School|Academy))/i,
        /(?:tell me about|what is|about|information about|details about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
        /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:University|College|Institute|School|Academy))\b/i,
      ]

      for (const pattern of patterns) {
        const match = query.match(pattern)
        if (match && match[1]) {
          const collegeName = match[1].trim()
          const result = await this.searchColleges(collegeName)
          if (result.length > 0) {
            // Check if the found college name closely matches
            const foundName = result[0].name.toLowerCase()
            const searchName = collegeName.toLowerCase()
            if (foundName.includes(searchName) || searchName.includes(foundName.split(' ')[0])) {
              return result[0]
            }
          }
        }
      }

      // Direct search with the query
      const directSearch = await this.searchColleges(query)
      if (directSearch.length > 0) {
        return directSearch[0]
      }

      return null
    } catch (error) {
      console.error("Error detecting college from query:", error)
      return null
    }
  }

  async searchColleges(query: string): Promise<CollegeSuggestion[]> {
    try {
      // Extract keywords from query
      const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2)
      
      if (keywords.length === 0) {
        return []
      }

      // Build search conditions - match any keyword in any field
      const searchConditions = keywords.flatMap(keyword => [
        ilike(colleges.name, `%${keyword}%`),
        ilike(colleges.location, `%${keyword}%`),
        ilike(colleges.city, `%${keyword}%`),
        ilike(colleges.description, `%${keyword}%`)
      ])

      // Search colleges by name, location, city, or description (only enabled ones)
      // Order by ranking (best first), then by name
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
        .where(
          and(
            eq(colleges.isEnabled, true),
            or(...searchConditions)
          )
        )
        .orderBy(asc(colleges.ranking), asc(colleges.name))
        .limit(10) // Get more results to filter duplicates

      // Remove duplicates based on normalized name (case-insensitive, remove extra spaces)
      const seen = new Set<string>()
      const uniqueResults: CollegeSuggestion[] = []
      
      for (const college of results) {
        // Normalize name: lowercase, trim, remove extra spaces
        const normalizedName = college.name.toLowerCase().trim().replace(/\s+/g, ' ')
        
        // Check if we've seen a similar name (exact match or very similar)
        let isDuplicate = false
        for (const seenName of seen) {
          // Check if names are very similar (one contains the other or vice versa)
          if (normalizedName === seenName || 
              normalizedName.includes(seenName) || 
              seenName.includes(normalizedName)) {
            // If one is significantly shorter, it's likely a duplicate
            const nameDiff = Math.abs(normalizedName.length - seenName.length)
            if (nameDiff < 10) { // If difference is small, likely duplicate
              isDuplicate = true
              break
            }
          }
        }
        
        if (!isDuplicate) {
          seen.add(normalizedName)
          uniqueResults.push(college)
          
          // Limit to 5 best results
          if (uniqueResults.length >= 5) {
            break
          }
        }
      }

      return uniqueResults
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

    // Check if user is asking about SeeMyCampus platform (not a college)
    const lowerMessage = actualMessage.toLowerCase()
    const isAboutPlatform = /\b(seemycampus|see my campus|about seemycampus|what is seemycampus|tell me about seemycampus)\b/i.test(actualMessage)
    
    if (isAboutPlatform) {
      return {
        response: "SeeMyCampus is an AI-powered admissions counseling platform helping Indian students find colleges. We've counseled over 50,000 students and provide information on 60,000+ institutions and 375,000+ courses. I'm here to help you find the right college!",
        suggestions: []
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
    // DO NOT search if user is asking for colleges - wait for follow-up questions to be answered
    // DO NOT search if user is asking about SeeMyCampus platform
    let collegeSuggestions: CollegeSuggestion[] = []
    let collegeContext = ""
    
    // Check if this is an initial college search query (user asking for colleges for the first time)
    // Exclude "seemycampus" queries as they're about the platform, not colleges
    const isInitialCollegeQuery = !isAboutPlatform &&
                                  /\b(college|colleges|university|universities|institute|institutes)\b/i.test(lowerMessage) &&
                                  /\b(best|top|show|find|search|list|recommend|suggest|tell me about)\b/i.test(lowerMessage)
    
    // Check conversation history to see if AI has already asked follow-up questions
    const recentAssistantMessages = this.conversationHistory
      .filter(msg => msg.role === "assistant")
      .slice(-3)
      .map(msg => msg.content.toLowerCase())
      .join(" ")
    
    const aiAskedCategory = /\b(category|which category|what category)\b/i.test(recentAssistantMessages)
    const aiAskedArea = /\b(area|location|which area|which location|which region)\b/i.test(recentAssistantMessages)
    
    // Check if user has answered follow-up questions (category and area)
    const recentUserMessages = this.conversationHistory
      .filter(msg => msg.role === "user")
      .slice(-5) // Check last 5 user messages
      .map(msg => msg.content.toLowerCase())
      .join(" ")
    
    const hasCategoryInfo = /\b(engineering|medical|arts|commerce|law|mba|science|management|bba|btech|mbbs|ba|bcom|business|computer|it)\b/i.test(recentUserMessages)
    const hasAreaInfo = /\b(area|location|region|zone|south|north|east|west|central|specific|particular)\b/i.test(recentUserMessages)
    
    // Only search for colleges if:
    // 1. It's NOT an initial college query (user hasn't asked for colleges yet), OR
    // 2. AI has asked follow-up questions AND user has provided BOTH category AND area information
    const shouldSearchColleges = includeColleges && (
      !isInitialCollegeQuery || 
      (aiAskedCategory && aiAskedArea && hasCategoryInfo && hasAreaInfo)
    )
    
    if (shouldSearchColleges) {
      collegeSuggestions = await this.searchColleges(actualMessage)
      
      if (collegeSuggestions.length > 0) {
        collegeContext = `\n\nRelevant colleges in our database:\n${collegeSuggestions.map((college, idx) => 
          `${idx + 1}. ${college.name}${college.city ? ` (${college.city})` : ""}${college.ranking ? ` - Rank: ${college.ranking}` : ""}${college.description ? ` - ${college.description.substring(0, 100)}...` : ""}`
        ).join("\n")}\n\nWhen mentioning these colleges, encourage students to visit /colleges/${collegeSuggestions[0].slug} for more details.`
      }
    }

    // Detect if user is asking about a specific college (e.g., "tell me about JMI", "what is Jamia Millia Islamia")
    let detectedCollege: CollegeSuggestion | null = null
    if (collegeSuggestions.length === 0 && 
        (lowerMessage.includes("tell me about") || lowerMessage.includes("what is") || lowerMessage.includes("about") ||
         lowerMessage.match(/\b(jmi|du|jnu|iit|nit|iim|aiims)\b/i))) {
      try {
        detectedCollege = await this.detectCollegeFromQuery(actualMessage)
        if (detectedCollege) {
          // Add detected college to suggestions
          collegeSuggestions = [detectedCollege]
          collegeContext = `\n\nRelevant college in our database:\n${detectedCollege.name}${detectedCollege.city ? ` (${detectedCollege.city})` : ""}${detectedCollege.ranking ? ` - Rank: ${detectedCollege.ranking}` : ""}${detectedCollege.description ? ` - ${detectedCollege.description.substring(0, 100)}...` : ""}\n\nWhen mentioning this college, encourage students to visit /colleges/${detectedCollege.slug} for more details.`
        }
      } catch (error) {
        console.error("Error detecting college:", error)
      }
    }

    // If no colleges found in database and user is asking about a specific college, search the web
    let webSearchResults: any[] = []
    let webSearchContext = ""
    if (collegeSuggestions.length === 0 && !detectedCollege &&
        (lowerMessage.includes("college") || lowerMessage.includes("university") || lowerMessage.includes("institute")) &&
        !lowerMessage.includes("show me") && !lowerMessage.includes("find") && !lowerMessage.includes("list")) {
      try {
        // Extract potential college name from query
        const collegeNameMatch = actualMessage.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:University|College|Institute|School|Academy)\b/i)
        if (collegeNameMatch) {
          const collegeName = collegeNameMatch[0]
          webSearchResults = await searchCollegeInfo(collegeName)
          
          if (webSearchResults.length > 0) {
            webSearchContext = `\n\nI found some information about ${collegeName} from web search:\n${webSearchResults.slice(0, 3).map((result, idx) => 
              `${idx + 1}. ${result.title}: ${result.snippet.substring(0, 150)}...`
            ).join("\n")}\n\nUse this information to provide a helpful answer. If the college is not in our database, suggest that the user can find more information on the college's official website.`
            
            // Try to extract and save college data with AI enrichment
            const extractedData = extractCollegeDataFromWeb(webSearchResults)
            if (extractedData.name || extractedData.website || webSearchResults.length > 0) {
              // Save to database with AI enrichment asynchronously (don't wait)
              saveAndEnrichCollegeFromWeb(collegeName, webSearchResults, extractedData).catch(err => 
                console.error("Error saving and enriching college from web search:", err)
              )
            }
          }
        }
      } catch (error) {
        console.error("Web search error:", error)
        // Continue without web search results
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
    // Note: We'll still try to use the provider even if not "configured" 
    // (e.g., Ollama might be running but not have env vars set)
    const isConfigured = this.isConfigured()
    if (!isConfigured) {
      console.warn("AI provider not fully configured. Will attempt to use it anyway, with fallback available.")
      
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
      // Handle "about seemycampus" queries
      else if (lowerMessage.includes("about seemycampus") || lowerMessage.includes("what is seemycampus") || lowerMessage.includes("tell me about seemycampus")) {
        fallbackResponse = "Welcome to SeeMyCampus! We're a platform designed to help students navigate the college admissions process in India. Here are our key features:\n\n1. **College Search**: Our database includes colleges and universities across India, helping you find the perfect match for your educational goals.\n2. **Course Explorer**: Find courses offered by each college, including degree programs, specializations, and electives.\n3. **Admission Guide**: Get information on admission requirements, entrance exams (JEE, NEET, CAT, etc.), application deadlines, and financial aid options.\n4. **Scholarship Match**: Our tool helps you find scholarships based on your interests, skills, and academic background.\n5. **Campus Insights**: Read reviews from current students and alumni to get a firsthand account of campus life.\n\nTo get started, what would you like to explore first?"
      }
      // Default helpful response
      else {
        fallbackResponse = "I'm here to help you with Indian colleges and course information! I can assist you with:\n\n• Finding the right colleges and courses in India\n• Understanding admission requirements and entrance exams\n• Exploring scholarship opportunities\n• Career counseling guidance\n• Fee calculations and cost estimates\n• Comparing colleges\n\nTry asking me about:\n• \"Show me engineering colleges in India\"\n• \"What are the admission requirements?\"\n• \"Tell me about scholarships\"\n• \"Help me calculate fees\"\n\nOr browse our website to explore colleges, courses, and more!"
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
      // Build enhanced system prompt with training data, college context, web search context, and page context
      // Use enhanced prompt if available, otherwise use base prompt
      let systemPrompt = SYSTEM_PROMPT
      try {
        // Try to get enhanced prompt (with training data) - cache this for performance
        const enhancedPrompt = await generateEnhancedSystemPrompt()
        if (enhancedPrompt && enhancedPrompt.length > SYSTEM_PROMPT.length) {
          systemPrompt = enhancedPrompt
        }
      } catch (error) {
        // Fallback to base prompt if enhanced prompt fails
        console.log("Using base system prompt (enhanced prompt unavailable)")
      }
      
      const enhancedSystemPrompt = systemPrompt + contextPrompt + collegeContext + webSearchContext

      // Build messages array with system prompt
      const messages = [
        { role: "system" as const, content: enhancedSystemPrompt },
        ...this.conversationHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ]

      console.log("Attempting to get AI response from provider:", process.env.AI_PROVIDER || "custom")
      
      // Get AI response with timeout handling
      const response = await Promise.race([
        this.provider.chat(messages),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 30000)
        ),
      ]) as string
      
      console.log("Successfully received AI response, length:", response.length)

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
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        provider: process.env.AI_PROVIDER,
      })
      
      // Provide more specific error messages
      if (error.message?.includes("timeout")) {
        return {
          response: "I'm taking longer than usual to respond. This might be due to high demand. Please try again in a moment, or feel free to browse our college listings directly while you wait.",
          suggestions: collegeSuggestions
        }
      }

      // Handle Ollama connection errors
      if (error.message?.includes("Cannot connect to Ollama") || error.message?.includes("ECONNREFUSED")) {
        const lowerMessage = actualMessage.toLowerCase()
        let fallbackResponse = "I'm having trouble connecting to my AI service right now. "
        
        // Still provide helpful responses based on the query
        if (lowerMessage.includes("college") || lowerMessage.includes("colleges")) {
          fallbackResponse += "While I get that sorted, you can browse our college listings to find the perfect match. Visit our colleges page to explore options."
        } else if (lowerMessage.includes("course") || lowerMessage.includes("program")) {
          fallbackResponse += "While I get that sorted, you can explore our courses page to find programs that match your interests."
        } else if (lowerMessage.includes("scholarship") || lowerMessage.includes("fee")) {
          fallbackResponse += "While I get that sorted, check out our scholarships page for financial aid opportunities, or use our fee calculator."
        } else {
          fallbackResponse += "While I get that sorted, you can browse our website to explore colleges, courses, scholarships, and more!"
        }
        
        if (collegeSuggestions.length > 0) {
          fallbackResponse += `\n\nI found ${collegeSuggestions.length} college${collegeSuggestions.length > 1 ? 's' : ''} that might interest you!`
        }
        
        return {
          response: fallbackResponse,
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

      // Generic fallback with helpful suggestions - try to still be helpful
      const lowerMessage = actualMessage.toLowerCase()
      let fallbackResponse = "I'm having a bit of trouble right now, but I can still help! "
      
      // Provide context-aware responses even on error
      if (lowerMessage.includes("college") || lowerMessage.includes("colleges") || lowerMessage.includes("university")) {
        fallbackResponse += "You can browse our college listings to explore options. "
        if (collegeSuggestions.length > 0) {
          fallbackResponse += `I found ${collegeSuggestions.length} college${collegeSuggestions.length > 1 ? 's' : ''} that match your search! `
        }
        fallbackResponse += "Visit our colleges page to see detailed information about programs, fees, and admission requirements."
      } else if (lowerMessage.includes("course") || lowerMessage.includes("program") || lowerMessage.includes("degree")) {
        fallbackResponse += "You can explore our courses page to find programs that match your interests. Check out course requirements, prerequisites, and career prospects."
      } else if (lowerMessage.includes("scholarship") || lowerMessage.includes("financial aid")) {
        fallbackResponse += "Check out our scholarships page for financial aid opportunities. You can filter by category, level, and eligibility requirements."
      } else if (lowerMessage.includes("fee") || lowerMessage.includes("cost") || lowerMessage.includes("tuition")) {
        fallbackResponse += "Use our fee calculator to estimate costs, or visit college pages for detailed fee breakdowns including tuition, hostel, and other expenses."
      } else if (lowerMessage.includes("admission") || lowerMessage.includes("apply") || lowerMessage.includes("entrance exam")) {
        fallbackResponse += "Visit our colleges page to see admission requirements, or check our entrance exams page for important dates and exam information."
      } else {
        fallbackResponse += "You can:\n• Browse our college listings\n• Explore courses and programs\n• Check out scholarship opportunities\n• Use our fee calculator\n• Contact our support team"
      }
      
      if (collegeSuggestions.length > 0 && !fallbackResponse.includes("college")) {
        fallbackResponse += `\n\n💡 I found ${collegeSuggestions.length} college${collegeSuggestions.length > 1 ? 's' : ''} that might interest you!`
      }
      
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


