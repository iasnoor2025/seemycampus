import type { AIProvider, AIProviderConfig } from "./base"

export class OllamaProvider implements AIProvider {
  private baseUrl: string
  private model: string

  constructor(config: AIProviderConfig) {
    this.baseUrl = config.apiUrl || process.env.OLLAMA_API_URL || "http://localhost:11434"
    this.model = config.model || process.env.OLLAMA_MODEL || "llama3.2:latest"
  }

  async chat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
  ): Promise<string> {
    try {
      // Ollama uses /api/chat endpoint
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: false, // Set to false for non-streaming responses
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText)
        let errorMessage = `Ollama API error: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = `Ollama API error: ${errorJson.error?.message || errorJson.error || response.statusText}`
        } catch {
          errorMessage = `Ollama API error: ${errorText || response.statusText}`
        }
        
        // Provide helpful error messages
        if (response.status === 404) {
          throw new Error("Ollama model not found. Please make sure the model is installed: ollama pull " + this.model)
        } else if (response.status === 0 || errorMessage.includes("fetch failed") || errorMessage.includes("ECONNREFUSED")) {
          throw new Error("Cannot connect to Ollama. Please make sure Ollama is running on " + this.baseUrl)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Ollama returns: { message: { role: "assistant", content: "..." } }
      if (data.message && data.message.content) {
        return data.message.content
      }
      
      throw new Error("Unexpected Ollama API response format")
    } catch (error: any) {
      console.error("Ollama provider error:", error)
      
      // Re-throw with more context for connection errors
      if (error.message?.includes("fetch failed") || error.message?.includes("ECONNREFUSED") || error.code === "ECONNREFUSED") {
        throw new Error("Cannot connect to Ollama. Please make sure Ollama is running on " + this.baseUrl)
      }
      
      throw error
    }
  }
}

