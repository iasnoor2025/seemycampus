import type { AIProvider, AIProviderConfig } from "./base"

export class OpenRouterProvider implements AIProvider {
  private apiKey: string
  private model: string
  private baseUrl: string

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey || process.env.OPENROUTER_API_KEY || ""
    this.model = config.model || process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo"
    this.baseUrl = config.apiUrl || "https://openrouter.ai/api/v1"
  }

  async chat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key not configured")
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": process.env.OPENROUTER_REFERER || process.env.NEXT_PUBLIC_SITE_URL || "",
          "X-Title": process.env.OPENROUTER_TITLE || "SeeMyCampus Chatbot",
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: 0.7,
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
        throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      
      // OpenRouter returns the same format as OpenAI
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content
      }
      
      // Fallback for different response formats
      if (data.content) {
        return data.content
      }
      
      throw new Error("Unexpected OpenRouter API response format")
    } catch (error) {
      console.error("OpenRouter provider error:", error)
      throw error
    }
  }
}

