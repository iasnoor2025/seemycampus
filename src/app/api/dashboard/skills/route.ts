import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { skills } from "@/db/schema"
import { desc, sql, eq } from "drizzle-orm"

// GET - Fetch all skills
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const getAll = searchParams.get("all") === "true" || limit >= 10000

        let query = db.select().from(skills).orderBy(desc(skills.createdAt))

        if (!getAll) {
            const offset = (page - 1) * limit
            query = query.limit(limit).offset(offset) as any
        }

        const skillsList = await query

        const totalCountResult = await db
            .select({ count: sql<number>`count(*)`.as('count') })
            .from(skills)
        const totalCount = Number(totalCountResult[0]?.count || 0)
        const totalPages = getAll ? 1 : Math.ceil(totalCount / limit)

        return NextResponse.json({
            skills: skillsList,
            pagination: {
                currentPage: getAll ? 1 : page,
                totalPages,
                totalCount,
                limit: getAll ? totalCount : limit,
            },
        })
    } catch (error) {
        console.error("Error fetching skills:", error)
        return NextResponse.json(
            { error: "Failed to fetch skills" },
            { status: 500 }
        )
    }
}

// POST - Create a new skill
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, slug, category, description, icon } = body

        if (!name || !slug) {
            return NextResponse.json(
                { error: "Name and slug are required" },
                { status: 400 }
            )
        }

        const [newSkill] = await db
            .insert(skills)
            .values({
                name,
                slug,
                category,
                description,
                icon,
            })
            .returning()

        return NextResponse.json(newSkill, { status: 201 })
    } catch (error: any) {
        console.error("Error creating skill:", error)
        if (error.code === "23505") {
            return NextResponse.json(
                { error: "Skill with this slug already exists" },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: "Failed to create skill" },
            { status: 500 }
        )
    }
}
