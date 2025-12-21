import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Find Your Perfect College</CardTitle>
            <CardDescription className="text-lg">
              Take our quick quiz to discover colleges that match your interests, budget, and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our AI-powered recommendation engine will analyze your answers and suggest the best colleges
              for you. The quiz takes just a few minutes to complete.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Select your interests and preferred subjects</li>
              <li>Choose your preferred location</li>
              <li>Set your budget range</li>
              <li>Pick your study mode preference</li>
              <li>Specify your academic level</li>
            </ul>
            <div className="pt-4">
              <Link href="/quiz/form">
                <Button size="lg" className="w-full">
                  Start Quiz
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

