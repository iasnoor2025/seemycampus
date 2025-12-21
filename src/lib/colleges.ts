import { db } from "@/db"
import { colleges, courses } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getAllColleges() {
  return await db.select().from(colleges)
}

export async function getCollegeBySlug(slug: string) {
  const [college] = await db
    .select()
    .from(colleges)
    .where(eq(colleges.slug, slug))
    .limit(1)

  return college || null
}

export async function getCollegeWithCourses(slug: string) {
  const college = await getCollegeBySlug(slug)
  if (!college) return null

  const collegeCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.collegeId, college.id))

  return {
    ...college,
    courses: collegeCourses,
  }
}

export async function getCollegesByLocation(location: string) {
  return await db
    .select()
    .from(colleges)
    .where(eq(colleges.location, location))
}

