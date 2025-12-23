import { Metadata } from "next"
import { CollegeComparison } from "@/components/colleges/CollegeComparison"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  title: "Compare Colleges | SeeMyCampus",
  description: "Compare multiple colleges side-by-side. Compare fees, rankings, courses, placements, and more to make an informed decision.",
  keywords: ["compare colleges", "college comparison", "college fees comparison", "college ranking comparison", "education comparison"],
  openGraph: {
    title: "Compare Colleges | SeeMyCampus",
    description: "Compare multiple colleges side-by-side. Compare fees, rankings, courses, placements, and more.",
    url: `${baseUrl}/compare`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/main-logo-xxxx.png`,
        width: 1200,
        height: 630,
        alt: "Compare Colleges - SeeMyCampus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Colleges | SeeMyCampus",
    description: "Compare multiple colleges side-by-side to make an informed decision.",
  },
  alternates: {
    canonical: `${baseUrl}/compare`,
  },
}

export default function ComparePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/colleges">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Colleges
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Compare Colleges</h1>
        <p className="text-muted-foreground">
          Select up to 4 colleges to compare side-by-side and make an informed decision.
        </p>
      </div>

      <CollegeComparison />
    </div>
  )
}

