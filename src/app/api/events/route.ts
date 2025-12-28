import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { events } from "@/db/schema"
import { eq, and, gte, lte, or, desc } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const upcoming = searchParams.get("upcoming") === "true"
    const limit = parseInt(searchParams.get("limit") || "100")

    let query = db.select().from(events).where(eq(events.isActive, true))

    if (type) {
      query = query.where(and(eq(events.isActive, true), eq(events.type, type)))
    }

    if (upcoming) {
      const now = new Date()
      query = query.where(and(eq(events.isActive, true), gte(events.startDate, now)))
    }

    const allEvents = await query.orderBy(desc(events.startDate)).limit(limit)

    return NextResponse.json({ events: allEvents })
  } catch (error: any) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      description,
      type = "webinar",
      startDate,
      endDate,
      registrationDeadline,
      maxAttendees,
      platform,
      meetingLink,
      location,
      organizer,
      organizerEmail,
      imageUrl,
      tags = [],
      isPublic = true,
    } = body

    if (!title || !slug || !startDate) {
      return NextResponse.json(
        { error: "Title, slug, and start date are required" },
        { status: 400 }
      )
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        title,
        slug,
        description,
        type,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        maxAttendees: maxAttendees || null,
        platform,
        meetingLink,
        location,
        organizer,
        organizerEmail,
        imageUrl,
        tags,
        isPublic,
        isActive: true,
      })
      .returning()

    return NextResponse.json({ event: newEvent }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    )
  }
}

