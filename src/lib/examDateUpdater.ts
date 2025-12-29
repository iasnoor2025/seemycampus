// Utility functions for automatic exam date updates

/**
 * Get the current academic year (April to March cycle)
 * Returns the starting year of the current academic year
 */
export function getCurrentAcademicYear(): number {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12 (January = 1, December = 12)
  
  // Academic year in India runs from April to March
  // If month is April (4) to December (12), academic year started this year
  // If month is January (1) to March (3), academic year started last year
  if (currentMonth >= 4) {
    return currentYear
  } else {
    return currentYear - 1
  }
}

/**
 * Get the academic year from a date
 */
export function getAcademicYearFromDate(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  
  if (month >= 4) {
    return year
  } else {
    return year - 1
  }
}

/**
 * Check if exam dates need to be updated based on academic year
 */
export function shouldUpdateExamDates(examDate: Date | null): boolean {
  if (!examDate) return false
  
  const examAcademicYear = getAcademicYearFromDate(examDate)
  const currentAcademicYear = getCurrentAcademicYear()
  
  // Update if exam date is from a past academic year
  return examAcademicYear < currentAcademicYear
}

/**
 * Increment a date by one year while preserving the month and day
 */
export function incrementDateByYear(date: Date): Date {
  const newDate = new Date(date)
  newDate.setFullYear(newDate.getFullYear() + 1)
  return newDate
}

/**
 * Increment exam dates by one year
 */
export function incrementExamDatesByYear(exam: {
  examDate: Date | null
  registrationStartDate: Date | null
  registrationEndDate: Date | null
  resultDate: Date | null
}): {
  examDate: Date | null
  registrationStartDate: Date | null
  registrationEndDate: Date | null
  resultDate: Date | null
} {
  return {
    examDate: exam.examDate ? incrementDateByYear(exam.examDate) : null,
    registrationStartDate: exam.registrationStartDate ? incrementDateByYear(exam.registrationStartDate) : null,
    registrationEndDate: exam.registrationEndDate ? incrementDateByYear(exam.registrationEndDate) : null,
    resultDate: exam.resultDate ? incrementDateByYear(exam.resultDate) : null,
  }
}

