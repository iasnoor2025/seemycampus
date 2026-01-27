import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { skills } from "@/db/schema"
import { eq } from "drizzle-orm"

// PATCH - Update a skill
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = params
        const body = await request.json()
        const { name, slug, category, description, icon, isActive } = body

        const [updatedSkill] = await db
            .update(skills)
            .set({
                name,
                slug,
                category,
                description,
                icon,
                isActive,
                updatedAt: new Date(),
            })
            .where(eq(skills.id, parseInt(id)))
            .returning()

        if (!updatedSkill) {
            return NextResponse.json({ error: "Skill not found" }, { status: 404 })
        }

        return NextResponse.json(updatedSkill)
    } catch (error) {
        console.error("Error updating skill:", error)
        return NextResponse.json(
            { error: "Failed to update skill" },
            { status: 500 }
        )
    }
}

// DELETE - Delete a skill
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = params
        const [deletedSkill] = await db
            .delete(skills)
            .where(eq(skills.id, parseInt(id)))
            .returning()

        if (!deletedSkill) {
            return NextResponse.json({ error: "Skill not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Skill deleted successfully" })
    } catch (error) {
        console.error("Error deleting skill:", error)
        return NextResponse.json(
            { error: "Failed to delete skill" },
            { status: 500 }
        )
    }
}
