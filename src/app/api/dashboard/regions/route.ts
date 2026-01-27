import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { regions } from "@/db/schema"
import { desc, sql, eq } from "drizzle-orm"

// GET - Fetch all regions
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get("type")
        const parentId = searchParams.get("parentId")
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const getAll = searchParams.get("all") === "true" || limit >= 10000

        let query = db.select().from(regions).orderBy(desc(regions.createdAt))

        // Add filters if any (this is basic, could be more complex with drizzle-orm)
        // For simplicity, we'll just fetch and filter in memory if needed, or refine here

        const regionsList = await query

        return NextResponse.json({
            regions: regionsList,
        })
    } catch (error) {
        console.error("Error fetching regions:", error)
        return NextResponse.json(
            { error: "Failed to fetch regions" },
            { status: 500 }
        )
    }
}

// POST - Create a new region
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, slug, type, parentId, imageUrl, description } = body

        if (!name || !slug || !type) {
            return NextResponse.json(
                { error: "Name, slug, and type are required" },
                { status: 400 }
            )
        }

        const [newRegion] = await db
            .insert(regions)
            .values({
                name,
                slug,
                type,
                parentId: parentId ? parseInt(parentId) : null,
                imageUrl,
                description,
            })
            .returning()

        return NextResponse.json(newRegion, { status: 201 })
    } catch (error: any) {
        console.error("Error creating region:", error)
        if (error.code === "23505") {
            return NextResponse.json(
                { error: "Region with this slug already exists" },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: "Failed to create region" },
            { status: 500 }
        )
    }
}
