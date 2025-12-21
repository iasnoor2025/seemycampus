import { NextRequest, NextResponse } from "next/server"
import { Chatbot } from "@/lib/ai/chatbot"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, clearHistory } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Create a new chatbot instance for each request
    // In production, you might want to maintain sessions
    const chatbot = new Chatbot()

    if (clearHistory) {
      chatbot.clearHistory()
    }

    const response = await chatbot.sendMessage(message)

    return NextResponse.json({
      response,
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

