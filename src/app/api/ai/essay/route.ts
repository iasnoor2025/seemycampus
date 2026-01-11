import { NextRequest, NextResponse } from "next/server"
import { generateEssay, analyzeEssay, checkPlagiarism, getTemplate } from "@/lib/ai/essayAssistance"

export async function POST(request: NextRequest) {
  try {
    // Essay Assistant is a public feature - no authentication required
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case "generate":
        const essay = await generateEssay(data)
        return NextResponse.json({ essay })

      case "analyze":
        if (!data.content) {
          return NextResponse.json(
            { error: "Content is required for analysis" },
            { status: 400 }
          )
        }
        const analysis = await analyzeEssay(data.content)
        return NextResponse.json({ analysis })

      case "plagiarism":
        if (!data.content) {
          return NextResponse.json(
            { error: "Content is required for plagiarism check" },
            { status: 400 }
          )
        }
        const plagiarismCheck = await checkPlagiarism(data.content)
        return NextResponse.json({ plagiarism: plagiarismCheck })

      case "template":
        if (!data.type) {
          return NextResponse.json(
            { error: "Essay type is required" },
            { status: 400 }
          )
        }
        const template = getTemplate(data.type)
        return NextResponse.json({ template })

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: generate, analyze, plagiarism, or template" },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error("Error in essay assistance:", error)
    return NextResponse.json(
      { 
        error: error.message || "Failed to process essay assistance request",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

