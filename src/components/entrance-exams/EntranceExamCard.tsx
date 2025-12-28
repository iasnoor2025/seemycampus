"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Globe, BookOpen, Clock, Info } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface EntranceExam {
  id: number
  name: string
  slug: string
  description: string | null
  examDate: string | null
  registrationStartDate: string | null
  registrationEndDate: string | null
  officialWebsite: string | null
  examPattern: string | null
}

interface EntranceExamCardProps {
  exam: EntranceExam
}

export function EntranceExamCard({ exam }: EntranceExamCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "TBD"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return "TBD"
    }
  }

  const isRegistrationOpen = () => {
    if (!exam.registrationStartDate || !exam.registrationEndDate) return false
    const now = new Date()
    const start = new Date(exam.registrationStartDate)
    const end = new Date(exam.registrationEndDate)
    return now >= start && now <= end
  }

  const isRegistrationUpcoming = () => {
    if (!exam.registrationStartDate) return false
    const now = new Date()
    const start = new Date(exam.registrationStartDate)
    return now < start
  }

  const isRegistrationClosed = () => {
    if (!exam.registrationEndDate) return false
    const now = new Date()
    const end = new Date(exam.registrationEndDate)
    return now > end
  }

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{exam.name}</CardTitle>
          {isRegistrationOpen() ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
              Registration Open
            </span>
          ) : isRegistrationUpcoming() ? (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
              Upcoming
            </span>
          ) : (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
              Closed
            </span>
          )}
        </div>
        <CardDescription className="line-clamp-2 mt-2">
          {exam.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs">Exam Date</span>
              <span className="font-semibold">{formatDate(exam.examDate)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-orange-600" />
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs">Registration Deadline</span>
              <span className={`font-semibold ${isRegistrationClosed() ? "text-red-600" : ""}`}>
                {formatDate(exam.registrationEndDate)}
              </span>
            </div>
          </div>

          {exam.examPattern && (
            <div className="flex items-start gap-3 text-sm">
              <BookOpen className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Exam Pattern</span>
                <span className="line-clamp-1 italic">{exam.examPattern}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-4 border-t">
        {exam.officialWebsite && (
          <a 
            href={exam.officialWebsite} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" className="w-full gap-2">
              <Globe className="h-4 w-4" />
              Official Site
            </Button>
          </a>
        )}
        <Link href={`/entrance-exams/${exam.slug}`} className="flex-1">
          <Button className="w-full gap-2">
            <Info className="h-4 w-4" />
            Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

