import { Metadata } from "next"
import { Suspense } from "react"
import { EssayAssistant } from "@/components/ai/EssayAssistant"
import { Loader2 } from "lucide-react"

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

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading assistant...</span>
            </div>
          }
        >
          <EssayAssistant />
        </Suspense>
      </div>
    </div>
  )
}

