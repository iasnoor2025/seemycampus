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

  // Get current academic year (April to March cycle)
  const getCurrentAcademicYear = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-12
    return currentMonth >= 4 ? currentYear : currentYear - 1
  }

  // Check if exam date is in current academic year
  const isExamInCurrentAcademicYear = () => {
    if (!exam.examDate) return false
    const examDate = new Date(exam.examDate)
    const examYear = examDate.getFullYear()
    const examMonth = examDate.getMonth() + 1
    const currentAcademicYear = getCurrentAcademicYear()
    
    // If exam is in April-December, it's in the academic year starting that year
    // If exam is in January-March, it's in the academic year starting the previous year
    if (examMonth >= 4) {
      return examYear === currentAcademicYear
    } else {
      return examYear === currentAcademicYear + 1
    }
  }

  const isRegistrationOpen = () => {
    if (!exam.registrationStartDate || !exam.registrationEndDate) {
      // If no registration dates but exam is in current academic year, check if exam date is upcoming
      if (isExamInCurrentAcademicYear() && exam.examDate) {
        const now = new Date()
        const examDate = new Date(exam.examDate)
        return now < examDate
      }
      return false
    }
    const now = new Date()
    const start = new Date(exam.registrationStartDate)
    const end = new Date(exam.registrationEndDate)
    // Set time to start of day for accurate comparison
    now.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    return now >= start && now <= end
  }

  const isRegistrationUpcoming = () => {
    if (!exam.registrationStartDate) {
      // If no registration start date but exam is in current academic year and exam date is future
      if (isExamInCurrentAcademicYear() && exam.examDate) {
        const now = new Date()
        const examDate = new Date(exam.examDate)
        now.setHours(0, 0, 0, 0)
        examDate.setHours(0, 0, 0, 0)
        return now < examDate
      }
      return false
    }
    const now = new Date()
    const start = new Date(exam.registrationStartDate)
    now.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    return now < start
  }

  const isRegistrationClosed = () => {
    if (!exam.registrationEndDate) {
      // If no registration end date, check if exam date has passed
      if (exam.examDate) {
        const now = new Date()
        const examDate = new Date(exam.examDate)
        now.setHours(0, 0, 0, 0)
        examDate.setHours(0, 0, 0, 0)
        return now > examDate
      }
      return false
    }
    const now = new Date()
    const end = new Date(exam.registrationEndDate)
    now.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    return now > end
  }

  const getStatus = () => {
    if (isRegistrationOpen()) {
      return { label: "Open", className: "bg-green-100 text-green-800" }
    } else if (isRegistrationUpcoming()) {
      return { label: "Soon", className: "bg-blue-100 text-blue-800" }
    } else if (isRegistrationClosed()) {
      return { label: "Closed", className: "bg-gray-100 text-gray-800" }
    } else {
      // Default to checking exam date if no registration info
      if (exam.examDate) {
        const now = new Date()
        const examDate = new Date(exam.examDate)
        now.setHours(0, 0, 0, 0)
        examDate.setHours(0, 0, 0, 0)
        if (now < examDate) {
          return { label: "Soon", className: "bg-blue-100 text-blue-800" }
        }
      }
      return { label: "Closed", className: "bg-gray-100 text-gray-800" }
    }
  }

  const status = getStatus()

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl flex-1">{exam.name}</CardTitle>
          <span className={`px-3 py-1 ${status.className} text-xs font-semibold rounded-full whitespace-nowrap`}>
            {status.label}
          </span>
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

