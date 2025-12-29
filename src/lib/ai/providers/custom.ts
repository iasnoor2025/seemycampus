import type { AIProvider, AIProviderConfig } from "./base"

export class CustomAIProvider implements AIProvider {
  private config: Required<AIProviderConfig>

  constructor(config: AIProviderConfig) {
    this.config = {
      apiKey: config.apiKey || process.env.AI_API_KEY || "",
      apiUrl: config.apiUrl || process.env.AI_API_URL || "",
      model: config.model || "default",
    }
  }

  async chat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
  ): Promise<string> {
    if (!this.config.apiUrl || !this.config.apiKey) {
      throw new Error("AI API not configured. Please set AI_API_URL and AI_API_KEY environment variables.")
    }

    try {
      const response = await fetch(this.config.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Handle different response formats
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content
      }
      if (data.content) {
        return data.content
      }
      if (data.message) {
        return data.message
      }
      if (typeof data === "string") {
        return data
      }

      throw new Error("Unexpected AI API response format")
    } catch (error) {
      console.error("Custom AI provider error:", error)
      throw error
    }
  }
}

