import { colleges, courses, studentAnswers } from "@/db/schema"
import { generateRecommendationExplanation, type RecommendationContext } from "@/lib/ai/recommendationExplanations"

interface QuizAnswers {
  interests?: string[] | null
  preferredLocation?: string | null
  budgetMin?: number | null
  budgetMax?: number | null
  studyMode?: string | null
  academicLevel?: string | null
}

interface CollegeWithCourses {
  college: typeof colleges.$inferSelect
  courses: (typeof courses.$inferSelect)[]
}

export interface ScoredCollege extends CollegeWithCourses {
  score: number
  matchReasons: string[]
  aiExplanation?: string // AI-generated personalized explanation
}

export function calculateCollegeScore(
  college: CollegeWithCourses,
  quizAnswers: QuizAnswers
): ScoredCollege {
  let score = 0
  const matchReasons: string[] = []

  // Location match (40 points)
  if (quizAnswers.preferredLocation) {
    const locationLower = quizAnswers.preferredLocation.toLowerCase()
    const collegeLocation = (
      college.college.city ||
      college.college.location ||
      ""
    ).toLowerCase()

    if (collegeLocation.includes(locationLower) || locationLower.includes(collegeLocation)) {
      score += 40
      matchReasons.push("Location matches your preference")
    } else {
      // Partial match (20 points)
      const locationWords = locationLower.split(/\s+/)
      const hasPartialMatch = locationWords.some((word) => collegeLocation.includes(word))
      if (hasPartialMatch) {
        score += 20
        matchReasons.push("Location partially matches")
      }
    }
  }

  // Course availability match (30 points)
  if (quizAnswers.interests && quizAnswers.interests.length > 0 && college.courses.length > 0) {
    const interestLower = quizAnswers.interests.map((i) => i.toLowerCase())
    const matchingCourses = college.courses.filter((course) => {
      const courseNameLower = course.name.toLowerCase()
      return interestLower.some((interest) => courseNameLower.includes(interest))
    })

    if (matchingCourses.length > 0) {
      score += 30
      matchReasons.push(`Offers courses in ${matchingCourses.length} of your interest areas`)
    }
  }

  // Study mode match (15 points)
  if (quizAnswers.studyMode && college.courses.length > 0) {
    const matchingCourses = college.courses.filter(
      (course) => course.studyMode?.toLowerCase() === quizAnswers.studyMode?.toLowerCase()
    )
    if (matchingCourses.length > 0) {
      score += 15
      matchReasons.push(`Offers ${quizAnswers.studyMode} programs`)
    }
  }

  // Budget compatibility (15 points)
  if (quizAnswers.budgetMin && quizAnswers.budgetMax && college.courses.length > 0) {
    const coursesInBudget = college.courses.filter((course) => {
      if (!course.fees) return false
      return (
        course.fees >= (quizAnswers.budgetMin || 0) &&
        course.fees <= (quizAnswers.budgetMax || Infinity)
      )
    })

    if (coursesInBudget.length > 0) {
      score += 15
      matchReasons.push(`${coursesInBudget.length} courses within your budget`)
    } else {
      // Check if any course is close to budget (within 20%)
      const budgetRange = (quizAnswers.budgetMax || 0) - (quizAnswers.budgetMin || 0)
      const tolerance = budgetRange * 0.2
      const closeCourses = college.courses.filter((course) => {
        if (!course.fees) return false
        const minBudget = (quizAnswers.budgetMin || 0) - tolerance
        const maxBudget = (quizAnswers.budgetMax || 0) + tolerance
        return course.fees >= minBudget && course.fees <= maxBudget
      })

      if (closeCourses.length > 0) {
        score += 8
        matchReasons.push("Some courses close to your budget")
      }
    }
  }

  // Academic level match (bonus points)
  if (quizAnswers.academicLevel && college.courses.length > 0) {
    const levelMap: Record<string, string[]> = {
      high_school: ["diploma", "certificate"],
      undergraduate: ["bachelor", "undergraduate", "btech", "bba", "bsc"],
      graduate: ["master", "graduate", "mtech", "mba", "msc", "phd"],
      diploma: ["diploma", "certificate"],
    }

    const relevantLevels = levelMap[quizAnswers.academicLevel] || []
    const matchingCourses = college.courses.filter((course) => {
      if (!course.level) return false
      const courseLevelLower = course.level.toLowerCase()
      return relevantLevels.some((level) => courseLevelLower.includes(level))
    })

    if (matchingCourses.length > 0) {
      score += 10
      matchReasons.push(`Offers ${quizAnswers.academicLevel} level programs`)
    }
  }

  return {
    ...college,
    score,
    matchReasons,
  }
}

