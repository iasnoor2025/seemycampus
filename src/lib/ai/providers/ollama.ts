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
      // Create an AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout for faster page loads
      
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
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text().catch(() => response.statusText)
          let errorMessage = `Ollama API error: ${response.statusText}`
          
          // Check if response is HTML (like Cloudflare error pages)
          const isHtml = errorText.trim().startsWith("<!DOCTYPE") || errorText.trim().startsWith("<html")
          
          if (!isHtml) {
            try {
              const errorJson = JSON.parse(errorText)
              errorMessage = `Ollama API error: ${errorJson.error?.message || errorJson.error || response.statusText}`
            } catch {
              // If not JSON and not HTML, use the text
              if (errorText && errorText.length < 500) {
                errorMessage = `Ollama API error: ${errorText}`
              }
            }
          }
          
          // Provide helpful error messages
          if (response.status === 404) {
            throw new Error("Ollama model not found. Please make sure the model is installed: ollama pull " + this.model)
          } else if (response.status === 502 || response.status === 503 || response.status === 504) {
            throw new Error("Ollama service unavailable (Bad Gateway). The service may be down or unreachable.")
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
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        // Handle timeout/abort errors
        if (fetchError.name === "AbortError" || fetchError.message?.includes("aborted")) {
          throw new Error("Ollama request timed out after 3 seconds")
        }
        
        throw fetchError
      }
    } catch (error: any) {
      // Don't log expected errors (service unavailable, timeout, connection issues)
      // These are handled gracefully by the calling code
      const errorMsg = (error?.message || error?.toString() || "").toLowerCase()
      const isExpectedError = 
        errorMsg.includes("service unavailable") || 
        errorMsg.includes("timed out") ||
        errorMsg.includes("timeout") ||
        errorMsg.includes("cannot connect") ||
        errorMsg.includes("bad gateway") ||
        errorMsg.includes("connection") ||
        errorMsg.includes("econnrefused") ||
        error?.name === "AbortError"
      
      if (!isExpectedError) {
        console.error("Ollama provider error:", error?.message || error)
      }
      
      // Re-throw with more context for connection errors
      if (error.message?.includes("fetch failed") || error.message?.includes("ECONNREFUSED") || error.code === "ECONNREFUSED") {
        throw new Error("Cannot connect to Ollama. Please make sure Ollama is running on " + this.baseUrl)
      }
      
      throw error
    }
  }
}

