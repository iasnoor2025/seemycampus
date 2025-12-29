import { NextRequest, NextResponse } from "next/server"
import { Chatbot } from "@/lib/ai/chatbot"
import type { ChatMessage } from "@/lib/ai/chatbot"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, clearHistory, includeColleges, history } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Create a new chatbot instance for each request
    const chatbot = new Chatbot()

    if (clearHistory) {
      chatbot.clearHistory()
    } else if (history && Array.isArray(history)) {
      // Restore conversation history if provided
      // This allows maintaining context across requests
      const chatHistory: ChatMessage[] = history.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }))
      
      // Restore history to chatbot (we'll need to add a method for this)
      // For now, we'll pass it to sendMessage
      const result = await chatbot.sendMessage(
        message,
        includeColleges !== false,
        chatHistory
      )

      return NextResponse.json({
        response: result.response,
        suggestions: result.suggestions,
        success: true,
      })
    }

    const result = await chatbot.sendMessage(message, includeColleges !== false)

    return NextResponse.json({
      response: result.response,
      suggestions: result.suggestions,
      success: true,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    )
  }
}

