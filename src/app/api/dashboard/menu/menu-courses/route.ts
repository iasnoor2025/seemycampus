import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { menuCourses } from "@/db/schema"
import { asc, eq } from "drizzle-orm"

// GET - Fetch all menu courses
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")

    let query = db.select().from(menuCourses)

    if (categoryId) {
      query = query.where(eq(menuCourses.categoryId, parseInt(categoryId))) as typeof query
    }

    const coursesList = await query
      .orderBy(asc(menuCourses.displayOrder), asc(menuCourses.name))

    return NextResponse.json({ courses: coursesList })
  } catch (error) {
    console.error("Error fetching menu courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu courses" },
      { status: 500 }
    )
  }
}

// POST - Create a new menu course
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, categoryId, href, displayOrder, isActive } = body

    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { error: "Name, slug, and category ID are required" },
        { status: 400 }
      )
    }

    // Auto-generate href if not provided
    const autoHref = href || `/courses/${slug}`

    const [newCourse] = await db
      .insert(menuCourses)
      .values({
        name,
        slug,
        categoryId: parseInt(categoryId),
        href: autoHref,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning()

    return NextResponse.json(newCourse, { status: 201 })
  } catch (error: any) {
    console.error("Error creating menu course:", error)
    return NextResponse.json(
      { error: "Failed to create menu course" },
      { status: 500 }
    )
  }
}

