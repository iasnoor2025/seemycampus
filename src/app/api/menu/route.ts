import { NextResponse } from "next/server"
import { db } from "@/db"
import { categories, menuCourses } from "@/db/schema"
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

    return NextResponse.json({ menu: menuStructure })
  } catch (error) {
    console.error("Error fetching menu:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    )
  }
}

