import { Metadata } from "next"
import { EssayAssistant } from "@/components/ai/EssayAssistant"

export const metadata: Metadata = {
  title: "Essay & SOP Assistant | SeeMyCampus",
  description: "Get AI-powered assistance for writing essays, SOPs, personal statements, and cover letters.",
}

export default function EssayAssistantPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Essay & SOP Assistant</h1>
          <p className="text-lg text-gray-600">
            Get AI-powered assistance for writing compelling essays, Statements of Purpose (SOP),
            personal statements, and cover letters.
          </p>
        </div>

        <EssayAssistant />
      </div>
    </div>
  )
}

