import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { isAutoApproved, type UserRole } from "@/lib/roles"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, isApproved } = body

    if (!userId || typeof isApproved !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get current user to check role
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // If user has auto-approved role, force approval
    const userRole = (currentUser.role || "student") as UserRole
    const finalApprovalStatus = isAutoApproved(userRole) ? true : isApproved

    // Update user approval status
    const [updatedUser] = await db
      .update(users)
      .set({
        isApproved: finalApprovalStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: `User ${isApproved ? "approved" : "rejected"} successfully`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isApproved: updatedUser.isApproved,
      },
    })
  } catch (error) {
    console.error("Error updating user approval:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

