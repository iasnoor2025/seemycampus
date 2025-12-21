import { db } from "@/db"
import { colleges, courses, studentAnswers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { calculateCollegeScore, type ScoredCollege } from "./scoring"

export async function getRecommendations(quizId: number): Promise<ScoredCollege[]> {
  // Get quiz answers
  const [quizData] = await db
    .select()
    .from(studentAnswers)
    .where(eq(studentAnswers.id, quizId))
    .limit(1)

  if (!quizData) {
    throw new Error("Quiz not found")
  }

  // Get all colleges with their courses
  const allColleges = await db.select().from(colleges)
  const allCourses = await db.select().from(courses)

  // Group courses by college
  const collegesWithCourses = allColleges.map((college) => ({
    college,
    courses: allCourses.filter((course) => course.collegeId === college.id),
  }))

  // Score each college
  const scoredColleges: ScoredCollege[] = collegesWithCourses.map((collegeData) =>
    calculateCollegeScore(collegeData, quizData)
  )

  // Sort by score (highest first) and return top 15
  return scoredColleges
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .filter((college) => college.score > 0) // Only return colleges with some match
}

