import type { AIProvider, AIProviderConfig } from "./base"

export class OpenAIProvider implements AIProvider {
  private apiKey: string
  private model: string

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || ""
    this.model = config.model || "gpt-3.5-turbo"
  }

  async chat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured")
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
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
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error("OpenAI provider error:", error)
      throw error
    }
  }
}

