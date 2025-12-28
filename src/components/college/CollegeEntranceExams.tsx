"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CollegeEntranceExamsProps {
  entranceExams: string[] | null
}

export function CollegeEntranceExams({ entranceExams }: CollegeEntranceExamsProps) {
  if (!entranceExams || !Array.isArray(entranceExams) || entranceExams.length === 0) {
    return null
  }

  // Map exam names to slugs (approximate matching)
  const examSlugMap: Record<string, string> = {
    "CAT": "cat",
    "JEE Main": "jee-main",
    "JEE Advanced": "jee-advanced",
    "NEET": "neet",
    "CLAT": "clat",
    "MAT": "mat",
    "XAT": "xat",
    "GATE": "gate",
    "GMAT": "gmat",
    "BITSAT": "bitsat",
    "VITEEE": "viteee",
    "SRMJEE": "srmjee",
    "UPSEE": "upsee",
    "WBJEE": "wbjee",
    "MHT CET": "mht-cet",
    "KCET": "kcet",
    "COMEDK": "comedk",
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Entrance Exams Accepted
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {entranceExams.map((exam, index) => {
            const slug = examSlugMap[exam] || exam.toLowerCase().replace(/\s+/g, "-")
            return (
              <Link key={index} href={`/entrance-exams/${slug}`}>
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm px-3 py-1"
                >
                  {exam}
                </Badge>
              </Link>
            )
          })}
        </div>
        <div className="mt-4">
          <Link href="/entrance-exams">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View All Entrance Exams
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

