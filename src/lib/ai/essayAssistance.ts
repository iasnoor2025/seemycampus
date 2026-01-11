/**
 * AI Essay/SOP Assistance utilities
 * Uses AI providers (Ollama, OpenAI, OpenRouter, or Custom) configured via environment variables
 * Works exactly like the Chatbot class - supports any AI provider via AI_PROVIDER env var
 */

import { OllamaProvider } from "./providers/ollama"
import { OpenAIProvider } from "./providers/openai"
import { OpenRouterProvider } from "./providers/openrouter"
import { CustomAIProvider } from "./providers/custom"
import type { AIProvider } from "./providers/base"

export interface EssayRequest {
  type: "essay" | "sop" | "personal_statement" | "cover_letter"
  topic: string
  wordCount: number
  requirements: string
  userDraft?: string
  context?: {
    academicLevel?: string
    targetProgram?: string
    targetCollege?: string
    achievements?: string[]
    experiences?: string[]
  }
}

export interface EssayResponse {
  content: string
  suggestions: string[]
  improvements: string[]
  wordCount: number
  readabilityScore?: number
}

/**
 * Get AI provider instance (exactly like Chatbot class)
 * Supports: ollama, openrouter, openai, or custom providers via env vars
 */
function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || "custom"

  if (providerType === "ollama") {
    return new OllamaProvider({
      apiUrl: process.env.OLLAMA_API_URL || "http://localhost:11434",
      model: process.env.OLLAMA_MODEL || "llama3.2:latest",
    })
  } else if (providerType === "openrouter") {
    return new OpenRouterProvider({
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo",
    })
  } else if (providerType === "openai") {
    return new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    })
  } else {
    return new CustomAIProvider({
      apiKey: process.env.AI_API_KEY,
      apiUrl: process.env.AI_API_URL,
      model: process.env.AI_MODEL || "default",
    })
  }
}

/**
 * Generate essay/SOP content using AI (Ollama or other providers)
 */
export async function generateEssay(request: EssayRequest): Promise<EssayResponse> {
  const provider = getAIProvider()

  // Build the prompt for essay generation
  const essayTypeNames: Record<string, string> = {
    sop: "Statement of Purpose (SOP)",
    personal_statement: "Personal Statement",
    essay: "Essay",
    cover_letter: "Cover Letter",
  }

  const essayTypeName = essayTypeNames[request.type] || request.type

  let prompt = `You are an expert academic writing assistant. Generate a compelling ${essayTypeName} on the following topic:

Topic: ${request.topic}

Target Word Count: ${request.wordCount} words

`

  if (request.requirements) {
    prompt += `Specific Requirements:\n${request.requirements}\n\n`
  }

  if (request.userDraft) {
    prompt += `The user has provided a draft. Please improve and expand upon it while maintaining their voice and key points:\n\n${request.userDraft}\n\n`
  }

  if (request.context) {
    prompt += `Additional Context:\n`
    if (request.context.academicLevel) {
      prompt += `- Academic Level: ${request.context.academicLevel}\n`
    }
    if (request.context.targetProgram) {
      prompt += `- Target Program: ${request.context.targetProgram}\n`
    }
    if (request.context.targetCollege) {
      prompt += `- Target College: ${request.context.targetCollege}\n`
    }
    if (request.context.achievements?.length) {
      prompt += `- Achievements: ${request.context.achievements.join(", ")}\n`
    }
    if (request.context.experiences?.length) {
      prompt += `- Experiences: ${request.context.experiences.join(", ")}\n`
    }
    prompt += `\n`
  }

  prompt += `Please write a well-structured ${essayTypeName} that:
1. Has a compelling introduction that hooks the reader
2. Develops main points with specific examples and evidence
3. Maintains a clear narrative flow
4. Concludes with a strong summary and forward-looking statement
5. Is approximately ${request.wordCount} words
6. Uses professional, academic language appropriate for ${essayTypeName}
7. Shows authenticity and personal voice

Write the complete ${essayTypeName} now:`

  try {
    const content = await provider.chat([
      {
        role: "system",
        content: `You are an expert academic writing assistant specializing in ${essayTypeName}s. You write compelling, authentic, and well-structured academic documents.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    // Extract suggestions and improvements from AI response or generate them
    const suggestionsPrompt = `Based on the ${essayTypeName} you just generated, provide 3-5 specific suggestions for improvement or things the writer should consider. Return only a JSON array of strings, no other text. Example: ["Use specific examples from your experiences", "Connect your goals to the program/college"]`

    let suggestions: string[] = []
    let improvements: string[] = []

    try {
      const suggestionsResponse = await provider.chat([
        {
          role: "system",
          content: "You are a writing advisor. Return only JSON arrays, no other text.",
        },
        {
          role: "user",
          content: suggestionsPrompt,
        },
      ])

      // Try to parse JSON from response
      const suggestionsMatch = suggestionsResponse.match(/\[.*?\]/s)
      if (suggestionsMatch) {
        suggestions = JSON.parse(suggestionsMatch[0])
      } else {
        // Fallback: split by lines or common delimiters
        suggestions = suggestionsResponse
          .split(/[,\n]/)
          .map((s) => s.trim().replace(/^[-•*]\s*/, "").replace(/^["']|["']$/g, ""))
          .filter((s) => s.length > 10)
          .slice(0, 5)
      }
    } catch (error) {
      console.error("Error generating suggestions:", error)
      suggestions = [
        "Use specific examples from your experiences",
        "Connect your goals to the program/college",
        "Show passion and authenticity",
        "Proofread for grammar and clarity",
      ]
    }

    // Calculate word count and readability
    const wordCount = content.split(/\s+/).length
    const readabilityScore = Math.min(100, Math.max(60, 100 - Math.abs(wordCount - request.wordCount) / 10))

    return {
      content: content.trim(),
      suggestions: suggestions.length > 0 ? suggestions : [
        "Use specific examples from your experiences",
        "Connect your goals to the program/college",
        "Show passion and authenticity",
        "Proofread for grammar and clarity",
      ],
      improvements: improvements,
      wordCount,
      readabilityScore: Math.round(readabilityScore),
    }
  } catch (error: any) {
    console.error("Error generating essay:", error)
    throw new Error(`Failed to generate essay: ${error.message || "Unknown error"}`)
  }
}

/**
 * Analyze essay for grammar and style using AI
 */
export async function analyzeEssay(content: string): Promise<{
  grammarIssues: Array<{ line: number; issue: string; suggestion: string }>
  styleSuggestions: string[]
  wordCount: number
  readabilityScore: number
}> {
  const provider = getAIProvider()

  const analysisPrompt = `Analyze the following essay for grammar, style, and readability. Provide a comprehensive analysis in the following JSON format:

{
  "grammarIssues": [
    {"line": 1, "issue": "description of issue", "suggestion": "how to fix it"}
  ],
  "styleSuggestions": ["suggestion 1", "suggestion 2", ...],
  "readabilityScore": 85
}

Essay to analyze:
${content}

Return only the JSON object, no other text.`

  try {
    const analysisResponse = await provider.chat([
      {
        role: "system",
        content: "You are an expert writing analyst. Analyze essays for grammar, style, and readability. Always return valid JSON in the exact format requested.",
      },
      {
        role: "user",
        content: analysisPrompt,
      },
    ])

    // Try to extract JSON from response
    let analysis: {
      grammarIssues: Array<{ line: number; issue: string; suggestion: string }>
      styleSuggestions: string[]
      readabilityScore: number
    }

    const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0])
      } catch (parseError) {
        // If JSON parsing fails, create a basic analysis
        analysis = {
          grammarIssues: [],
          styleSuggestions: analysisResponse
            .split(/[,\n]/)
            .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
            .filter((s) => s.length > 10)
            .slice(0, 5),
          readabilityScore: 80,
        }
      }
    } else {
      // Fallback: create basic analysis
      analysis = {
        grammarIssues: [],
        styleSuggestions: [
          "Consider varying sentence length for better flow",
          "Use active voice where possible",
          "Ensure consistent tense throughout",
        ],
        readabilityScore: 80,
      }
    }

    const wordCount = content.split(/\s+/).length

    // Calculate readability score based on various factors
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0
    const avgCharsPerWord = content.replace(/\s+/g, "").length / wordCount

    // Simple readability calculation (Flesch-like)
    let readabilityScore = 100
    if (avgWordsPerSentence > 20) readabilityScore -= 10
    if (avgWordsPerSentence > 25) readabilityScore -= 10
    if (avgCharsPerWord > 5) readabilityScore -= 5
    if (sentences.length < wordCount / 15) readabilityScore -= 5

    // Use AI-provided score if available, otherwise use calculated
    const finalReadabilityScore = analysis.readabilityScore || Math.max(60, Math.min(100, readabilityScore))

    return {
      grammarIssues: analysis.grammarIssues || [],
      styleSuggestions: analysis.styleSuggestions || [
        "Consider varying sentence length for better flow",
        "Use active voice where possible",
        "Ensure consistent tense throughout",
      ],
      wordCount,
      readabilityScore: Math.round(finalReadabilityScore),
    }
  } catch (error: any) {
    console.error("Error analyzing essay:", error)
    
    // Fallback analysis
    const wordCount = content.split(/\s+/).length
    return {
      grammarIssues: [],
      styleSuggestions: [
        "Consider varying sentence length for better flow",
        "Use active voice where possible",
        "Ensure consistent tense throughout",
      ],
      wordCount,
      readabilityScore: 75,
    }
  }
}

/**
 * Check for plagiarism (basic implementation)
 * Note: Full plagiarism detection requires external service
 */
export async function checkPlagiarism(content: string): Promise<{
  similarityScore: number
  flaggedSections: Array<{ text: string; similarity: number }>
}> {
  // TODO: Integrate with plagiarism detection service (Copyscape, Turnitin API, etc.)
  
  return {
    similarityScore: 0,
    flaggedSections: [],
  }
}

/**
 * Get essay templates by type
 */
export const essayTemplates: Record<string, string> = {
  sop: `Statement of Purpose Template:

1. Introduction (10-15% of word count)
   - Hook: Engaging opening
   - Context: Brief background
   - Thesis: Your main goal

2. Academic Background (20-25%)
   - Relevant coursework
   - Research experience
   - Academic achievements

3. Professional Experience (20-25%)
   - Work experience
   - Internships
   - Projects

4. Why This Program/College (20-25%)
   - Specific reasons
   - Faculty interests
   - Resources available

5. Future Goals (15-20%)
   - Short-term goals
   - Long-term aspirations
   - How program helps

6. Conclusion (5-10%)
   - Summary
   - Call to action
`,

  personal_statement: `Personal Statement Template:

1. Opening Story (15-20%)
   - Personal anecdote
   - Moment of realization
   - Connection to your journey

2. Your Journey (30-35%)
   - Challenges faced
   - Growth and learning
   - Key experiences

3. Your Values (20-25%)
   - What drives you
   - Core principles
   - Personal philosophy

4. Your Goals (20-25%)
   - What you want to achieve
   - How education helps
   - Your vision

5. Closing (5-10%)
   - Reflection
   - Forward-looking statement
`,

  essay: `General Essay Template:

1. Introduction
   - Hook
   - Background
   - Thesis statement

2. Body Paragraphs (3-5 paragraphs)
   - Topic sentence
   - Evidence/examples
   - Analysis
   - Transition

3. Conclusion
   - Restate thesis
   - Summarize main points
   - Final thought
`,
}

export function getTemplate(type: string): string {
  return essayTemplates[type] || essayTemplates.essay
}

