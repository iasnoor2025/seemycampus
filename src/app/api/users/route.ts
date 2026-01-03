import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { isAutoApproved } from "@/lib/roles"

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isApproved: users.isApproved,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(users.createdAt)

    return NextResponse.json({ users: allUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST create new user (admin only)
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
    const { name, email, password, role, isApproved } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, and password are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Determine approval status
    // If role is auto-approved, set isApproved to true
    // Otherwise, use the provided isApproved value or default to false
    const userRole = role || "student"
    const shouldApprove = isAutoApproved(userRole as any) 
      ? true 
      : (isApproved === true ? true : false)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: userRole,
        isApproved: shouldApprove,
      })
      .returning()

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isApproved: newUser.isApproved,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating user:", error)
    
    // Handle unique constraint violation
    if (error.code === "23505" || error.message?.includes("unique")) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

