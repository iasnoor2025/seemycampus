import { NextResponse } from "next/server"
import { db } from "@/db"
import { entranceExams } from "@/db/schema"
import { asc, eq, gte, lte, and, or, isNull } from "drizzle-orm"

// Helper function to get current academic year start (April 1st)
function getCurrentAcademicYearStart(): Date {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12 (January = 1, December = 12)

  // Academic year in India runs from April to March
  // If month is April (4) to December (12), academic year started this year
  // If month is January (1) to March (3), academic year started last year
  if (currentMonth >= 4) {
    return new Date(currentYear, 3, 1) // April 1st of current year
  } else {
    return new Date(currentYear - 1, 3, 1) // April 1st of previous year
  }
}

// Helper function to get next academic year end (March 31st, 2 years from now)
function getNextAcademicYearEnd(): Date {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Return March 31st of the academic year after next
  if (currentMonth >= 4) {
    return new Date(currentYear + 2, 2, 31) // March 31st, 2 years from now
  } else {
    return new Date(currentYear + 1, 2, 31) // March 31st, next year
  }
}

export async function GET() {
  try {
    const academicYearStart = getCurrentAcademicYearStart()
    const academicYearEnd = getNextAcademicYearEnd()

    // Fetch exams that are:
    // 1. Active
    // 2. Either have no exam date (TBD) OR have exam date within current/next academic year
    const exams = await db
      .select()
      .from(entranceExams)
      .where(
        and(
          eq(entranceExams.isActive, true),
          and(
            gte(entranceExams.examDate, academicYearStart),
            lte(entranceExams.examDate, academicYearEnd)
          )
        )
      )
      .orderBy(asc(entranceExams.examDate))

    // Filter out exams that have passed (exam date is in the past, but keep current academic year exams)
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Normalize to start of day

    const filteredExams = exams.filter(exam => {
      if (!exam.examDate) return true // Keep exams without dates
      const examDate = new Date(exam.examDate)
      examDate.setHours(0, 0, 0, 0)
      // Keep exams that are in the future or within current academic year
      return examDate >= now || (examDate >= academicYearStart && examDate <= academicYearEnd)
    })

    return NextResponse.json(filteredExams)
  } catch (error: any) {
    console.error("Error fetching entrance exams:", error)
    return NextResponse.json({ error: "Failed to fetch entrance exams" }, { status: 500 })
  }
}

