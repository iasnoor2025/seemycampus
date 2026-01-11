/**
 * AI-Powered Blog Content Generation
 * Generates blog posts, SEO titles, and content suggestions
 */

import { OllamaProvider } from "./providers/ollama"
import { OpenAIProvider } from "./providers/openai"
import { OpenRouterProvider } from "./providers/openrouter"
import { CustomAIProvider } from "./providers/custom"
import type { AIProvider } from "./providers/base"
import { isAIEnabled } from "./aiEnabled"
import { getAIConfig } from "./config"

async function getAIProvider(): Promise<AIProvider | null> {
  try {
    const config = await getAIConfig()
    const providerType = config.providerType

    if (providerType === "ollama") {
      return new OllamaProvider({
        apiUrl: config.ollamaApiUrl || "http://localhost:11434",
        model: config.ollamaModel || "llama3.2:latest",
      })
    } else if (providerType === "openrouter") {
      const apiKey = config.openrouterApiKey
      if (!apiKey) return null
      return new OpenRouterProvider({
        apiKey,
        model: config.openrouterModel || "openai/gpt-3.5-turbo",
      })
    } else if (providerType === "openai") {
      const apiKey = config.openaiApiKey
      if (!apiKey) return null
      return new OpenAIProvider({
        apiKey,
        model: config.openaiModel || "gpt-3.5-turbo",
      })
    } else {
      const apiKey = config.customApiKey
      const apiUrl = config.customApiUrl
      if (!apiKey || !apiUrl) return null
      return new CustomAIProvider({
        apiKey,
        apiUrl,
        model: config.customModel || "default",
      })
    }
  } catch (error) {
    console.error("Failed to initialize AI provider for blog generation:", error)
    return null
  }
}

function getProviderErrorMessage(): string {
  const providerType = process.env.AI_PROVIDER || "custom"
  
  if (providerType === "ollama") {
    return "Ollama provider is selected but may not be properly configured. Make sure Ollama is running."
  } else if (providerType === "openrouter") {
    return "OpenRouter API key (OPENROUTER_API_KEY) is not set in environment variables."
  } else if (providerType === "openai") {
    return "OpenAI API key (OPENAI_API_KEY) is not set in environment variables."
  } else {
    return "Custom AI provider requires AI_API_KEY and AI_API_URL environment variables to be set."
  }
}

export interface BlogPostRequest {
  topic: string
  outline?: string[]
  wordCount?: number
  targetAudience?: string
  keywords?: string[]
  tone?: "professional" | "casual" | "informative"
}

export interface BlogPost {
  title: string
  excerpt: string
  content: string
  seoTitle?: string
  seoDescription?: string
  tags?: string[]
}

export interface InternalLink {
  keyword: string
  url: string
  title: string
  relevance: number
}

/**
 * Generate a complete blog post
 */
export async function generateBlogPost(
  request: BlogPostRequest,
  useAI: boolean = true
): Promise<BlogPost | null> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled) {
    return null
  }

  const provider = getAIProvider()
  if (!provider) {
    throw new Error(`AI provider not configured. ${getProviderErrorMessage()}`)
  }

  try {
    const wordCount = request.wordCount || 1000
    const outline = request.outline || []

    let prompt = `You are an expert content writer specializing in educational content for Indian students. Generate a comprehensive blog post.

Topic: ${request.topic}
Target Word Count: ${wordCount} words
Target Audience: ${request.targetAudience || "Indian students seeking college admission guidance"}
Tone: ${request.tone || "informative"}
${request.keywords && request.keywords.length > 0 ? `Keywords to include: ${request.keywords.join(", ")}` : ""}

${outline.length > 0 ? `Content Outline:\n${outline.map((item, i) => `${i + 1}. ${item}`).join("\n")}` : ""}

Requirements:
1. Write an engaging, SEO-optimized blog post
2. Use clear headings and subheadings
3. Include practical tips and actionable advice
4. Use relevant keywords naturally
5. Write in markdown format
6. Include a compelling introduction and conclusion
7. Make it informative and helpful for Indian students

Return the blog post in this JSON format:
{
  "title": "SEO-optimized title (60-70 characters)",
  "excerpt": "Compelling excerpt (120-160 characters)",
  "content": "Full blog post content in markdown",
  "seoTitle": "SEO title (50-60 characters)",
  "seoDescription": "SEO meta description (120-160 characters)",
  "tags": ["tag1", "tag2", "tag3"]
}

Return ONLY the JSON object, no other text.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert SEO content writer for educational websites. Return only valid JSON responses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          title: parsed.title || request.topic,
          excerpt: parsed.excerpt || "",
          content: parsed.content || "",
          seoTitle: parsed.seoTitle || parsed.title,
          seoDescription: parsed.seoDescription || parsed.excerpt,
          tags: parsed.tags || [],
        }
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError)
        console.error("AI Response:", response.substring(0, 500))
        return null
      }
    }

    console.error("No JSON found in AI response. Response:", response.substring(0, 500))
    return null
  } catch (error: any) {
    console.error("AI blog post generation failed:", error)
    console.error("Error details:", error.message, error.stack)
    throw error // Re-throw to be caught by API route
  }
}

/**
 * Generate multiple SEO-optimized title suggestions
 */
export async function generateSEOTitles(
  topic: string,
  count: number = 5,
  useAI: boolean = true
): Promise<string[]> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled) {
    return [topic]
  }

  const provider = await getAIProvider()
  if (!provider) {
    return [topic]
  }

  try {
    const prompt = `Generate ${count} SEO-optimized blog post titles for this topic.

Topic: ${topic}

Requirements:
- Each title should be 50-70 characters
- Include relevant keywords
- Be compelling and click-worthy
- Optimized for search engines
- Focus on Indian education/college admission context

Return a JSON array of titles: ["title1", "title2", ...]

Return ONLY the JSON array, no other text.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an SEO expert. Return only valid JSON arrays.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, count)
      }
    }

    return [topic]
  } catch (error) {
    console.error("AI SEO title generation failed:", error)
    return [topic]
  }
}

/**
 * Suggest internal links for blog content
 */
export async function suggestInternalLinks(
  content: string,
  availableLinks: Array<{ keyword: string; url: string; title: string }>,
  useAI: boolean = true
): Promise<InternalLink[]> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled || availableLinks.length === 0) {
    return []
  }

  const provider = await getAIProvider()
  if (!provider) {
    return []
  }

  try {
    const linksText = availableLinks
      .slice(0, 20)
      .map((link) => `- "${link.keyword}" -> ${link.url} (${link.title})`)
      .join("\n")

    const prompt = `Analyze this blog content and suggest relevant internal links.

Content:
${content.substring(0, 2000)}...

Available Links:
${linksText}

Return a JSON array of suggested links with relevance scores (0-1):
[
  {
    "keyword": "keyword to link",
    "url": "link URL",
    "title": "link title",
    "relevance": 0.9
  }
]

Only suggest links that are highly relevant (relevance > 0.7).

Return ONLY the JSON array, no other text.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an SEO expert. Return only valid JSON arrays.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed)) {
        return parsed
          .filter((link) => link.relevance > 0.7)
          .slice(0, 10)
      }
    }

    return []
  } catch (error) {
    console.error("AI internal link suggestion failed:", error)
    return []
  }
}

/**
 * Expand blog outline into full content
 */
export async function expandBlogOutline(
  outline: string[],
  topic: string,
  wordCount: number = 1000,
  useAI: boolean = true
): Promise<string | null> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled || outline.length === 0) {
    return null
  }

  const provider = await getAIProvider()
  if (!provider) {
    throw new Error(`AI provider not configured. ${getProviderErrorMessage()}`)
  }

  try {
    const prompt = `Expand this blog outline into a complete, well-written blog post.

Topic: ${topic}
Target Word Count: ${wordCount} words

Outline:
${outline.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Requirements:
1. Write comprehensive content for each section
2. Use markdown formatting
3. Include engaging introductions and transitions
4. Add practical examples and tips
5. Write in a helpful, informative tone
6. Focus on Indian education context

Return the complete blog post content in markdown format.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert content writer. Write comprehensive, well-structured blog posts.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    return response.trim()
  } catch (error) {
    console.error("AI blog outline expansion failed:", error)
    return null
  }
}
