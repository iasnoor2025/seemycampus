import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { regions } from "@/db/schema"
import { eq } from "drizzle-orm"

// PATCH - Update a region
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
        const { name, slug, type, parentId, imageUrl, description, isActive } = body

        const [updatedRegion] = await db
            .update(regions)
            .set({
                name,
                slug,
                type,
                parentId: parentId ? parseInt(parentId) : null,
                imageUrl,
                description,
                isActive,
                updatedAt: new Date(),
            })
            .where(eq(regions.id, parseInt(id)))
            .returning()

        if (!updatedRegion) {
            return NextResponse.json({ error: "Region not found" }, { status: 404 })
        }

        return NextResponse.json(updatedRegion)
    } catch (error) {
        console.error("Error updating region:", error)
        return NextResponse.json(
            { error: "Failed to update region" },
            { status: 500 }
        )
    }
}

// DELETE - Delete a region
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
        const [deletedRegion] = await db
            .delete(regions)
            .where(eq(regions.id, parseInt(id)))
            .returning()

        if (!deletedRegion) {
            return NextResponse.json({ error: "Region not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Region deleted successfully" })
    } catch (error) {
        console.error("Error deleting region:", error)
        return NextResponse.json(
            { error: "Failed to delete region" },
            { status: 500 }
        )
    }
}
