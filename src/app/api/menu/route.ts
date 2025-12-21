import { NextResponse } from "next/server"
import { db } from "@/db"
import { categories, menuCourses, studyGoals } from "@/db/schema"
import { eq, asc } from "drizzle-orm"

// GET - Fetch menu structure for public header
export async function GET() {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.displayOrder), asc(categories.name))

    const allMenuCourses = await db
      .select()
      .from(menuCourses)
      .where(eq(menuCourses.isActive, true))
      .orderBy(asc(menuCourses.displayOrder), asc(menuCourses.name))

    // Fetch active study goals
    const allStudyGoals = await db
      .select()
      .from(studyGoals)
      .where(eq(studyGoals.isActive, true))
      .orderBy(asc(studyGoals.displayOrder), asc(studyGoals.name))

    // Organize data into 2-level structure: Category -> Courses
    const menuStructure = allCategories.map((category) => {
      const courses = allMenuCourses
        .filter((c) => c.categoryId === category.id)
        .map((c) => ({
          name: c.name,
          href: c.href || `/courses/${c.slug}`,
        }))

      return {
        ...category,
        courses,
      }
    })

    // Get category slugs to check for duplicates
    const categorySlugs = new Set(allCategories.map((cat) => cat.slug.toLowerCase()))

    // Convert study goals to menu format (as categories with courses)
    // Only include study goals that don't already exist as categories
    const studyGoalsMenu = allStudyGoals
      .filter((goal) => !categorySlugs.has(goal.slug.toLowerCase()))
      .map((goal) => ({
        id: goal.id + 10000, // Offset to avoid conflicts with category IDs
        name: goal.name,
        slug: goal.slug,
        courses: (goal.courses || []).map((course) => ({
          name: course,
          href: goal.link || `/colleges/${goal.slug}`,
        })),
      }))

    // Combine categories and study goals (no duplicates)
    const combinedMenu = [...menuStructure, ...studyGoalsMenu]

    return NextResponse.json({ menu: combinedMenu })
  } catch (error) {
    console.error("Error fetching menu:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    )
  }
}

