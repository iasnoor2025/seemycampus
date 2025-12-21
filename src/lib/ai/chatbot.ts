import { SYSTEM_PROMPT, checkSafety } from "./prompts"
import { CustomAIProvider } from "./providers/custom"
import { OpenAIProvider } from "./providers/openai"
import type { AIProvider } from "./providers/base"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
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

  async sendMessage(userMessage: string): Promise<string> {
    // Safety check
    if (!checkSafety(userMessage)) {
      return "I'm here to help with educational questions about colleges and courses. For personal, financial, medical, or legal advice, please consult with appropriate professionals."
    }

    // Add user message to history
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    })

    try {
      // Build messages array with system prompt
      const messages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
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

      return response
    } catch (error) {
      console.error("Chatbot error:", error)
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact our support team."
    }
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  clearHistory(): void {
    this.conversationHistory = []
  }
}

