import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QuizPageClient } from "@/components/quiz/QuizPageClient"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  title: "Take Our Quiz | Find Your Perfect College | SeeMyCampus",
  description: "Answer a few questions to get personalized college recommendations tailored to your preferences. Our AI-powered recommendation engine will suggest the best colleges for you.",
  keywords: ["college quiz", "college finder", "college recommendations", "find college", "college matching", "education quiz"],
  openGraph: {
    title: "Take Our Quiz | Find Your Perfect College | SeeMyCampus",
    description: "Answer a few questions to get personalized college recommendations tailored to your preferences. Our AI-powered recommendation engine will suggest the best colleges for you.",
    url: `${baseUrl}/quiz`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/main-logo-xxxx.png`,
        width: 1200,
        height: 630,
        alt: "College Quiz - SeeMyCampus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Take Our Quiz | Find Your Perfect College",
    description: "Answer a few questions to get personalized college recommendations tailored to your preferences.",
  },
  alternates: {
    canonical: `${baseUrl}/quiz`,
  },
}

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium text-sm">Find Your Match</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              Take Our Quiz
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Answer a few questions to get personalized college recommendations tailored to your preferences.
            </p>
          </div>
        </div>
      </section>

      {/* Quiz Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <QuizPageClient />
        </div>
      </section>
    </div>
  )
}

