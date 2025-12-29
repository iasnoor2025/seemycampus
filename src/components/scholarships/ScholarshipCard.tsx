"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, GraduationCap, Building2 } from "lucide-react"
import { format } from "date-fns"

interface ScholarshipCardProps {
  scholarship: {
    id: number
    title: string
    slug: string
    description: string | null
    provider: string | null
    amount: number | null
    amountCurrency: string
    amountType: string | null
    applicationDeadline: string | null
    category: string | null
    level: string | null
    college: any
  }
}

export function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const formatAmount = () => {
    if (!scholarship.amount) return "Amount not specified"
    
    const currency = scholarship.amountCurrency === "INR" ? "₹" : scholarship.amountCurrency
    const amount = scholarship.amount.toLocaleString()
    
    if (scholarship.amountType === "percentage") {
      return `${amount}%`
    } else if (scholarship.amountType === "full_tuition") {
      return "Full Tuition"
    } else {
      return `${currency}${amount}`
    }
  }

  const formatDeadline = () => {
    if (!scholarship.applicationDeadline) return "Deadline not specified"
    try {
      return format(new Date(scholarship.applicationDeadline), "MMM dd, yyyy")
    } catch {
      return "Deadline not specified"
    }
  }

  const isDeadlinePassed = () => {
    if (!scholarship.applicationDeadline) return false
    try {
      return new Date(scholarship.applicationDeadline) < new Date()
    } catch {
      return false
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="line-clamp-2 text-lg">{scholarship.title}</CardTitle>
          {isDeadlinePassed() && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded whitespace-nowrap ml-2">
              Expired
            </span>
          )}
        </div>
        {scholarship.provider && (
          <CardDescription className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            {scholarship.provider}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        {scholarship.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {scholarship.description}
          </p>
        )}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-lg text-green-600">₹</span>
            <span className="font-medium">{formatAmount()}</span>
          </div>
          {scholarship.level && (
            <div className="flex items-center gap-2 text-gray-700">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <span className="capitalize">{scholarship.level}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className={isDeadlinePassed() ? "text-red-600 font-medium" : ""}>
              Deadline: {formatDeadline()}
            </span>
          </div>
          {scholarship.category && (
            <div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                {scholarship.category.replace("-", " ")}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/scholarships/${scholarship.slug}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

