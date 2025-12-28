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
  return <QuizPageClient />
}

