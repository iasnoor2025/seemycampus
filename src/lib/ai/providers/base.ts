export interface AIProvider {
  chat(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string>
}

export interface AIProviderConfig {
  apiKey?: string
  apiUrl?: string
  model?: string
}

