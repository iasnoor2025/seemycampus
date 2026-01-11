import { db } from "@/db"
import { colleges, courses, studentAnswers } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { calculateCollegeScore, type ScoredCollege } from "./scoring"
import { generateRecommendationExplanation, type RecommendationContext } from "@/lib/ai/recommendationExplanations"

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

  // Get all enabled colleges with their courses
  const allColleges = await db
    .select()
    .from(colleges)
    .where(eq(colleges.isEnabled, true))
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

  // Sort by score (highest first) and get top 15
  const topColleges = scoredColleges
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .filter((college) => college.score > 0)

  // Generate AI explanations for top recommendations (async, but don't block)
  const collegesWithExplanations = await Promise.all(
    topColleges.map(async (college) => {
      try {
        const context: RecommendationContext = {
          collegeName: college.college.name,
          location: college.college.location || college.college.city,
          ranking: college.college.ranking || null,
          score: college.score,
          matchReasons: college.matchReasons,
          userProfile: {
            interests: quizData.interests,
            preferredLocation: quizData.preferredLocation,
            budgetMin: quizData.budgetMin,
            budgetMax: quizData.budgetMax,
            studyMode: quizData.studyMode,
            academicLevel: quizData.academicLevel,
          },
          courses: college.courses,
          averagePackage: college.college.averagePackage || null,
          accreditation: college.college.accreditation || null,
        }

        const aiExplanation = await generateRecommendationExplanation(context, true)
        return {
          ...college,
          aiExplanation,
        }
      } catch (error) {
        console.error(`Failed to generate AI explanation for ${college.college.name}:`, error)
        return college
      }
    })
  )

  return collegesWithExplanations
}

