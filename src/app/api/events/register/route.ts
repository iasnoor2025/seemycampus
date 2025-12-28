import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { eventRegistrations, events } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventSlug, name, email, phone } = body

    if (!eventSlug || !name || !email) {
      return NextResponse.json(
        { error: "Event slug, name, and email are required" },
        { status: 400 }
      )
    }

    // Get event
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.slug, eventSlug))
      .limit(1)

    if (!event || !event.isActive) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 }
      )
    }

    // Check if event is full
    const existingRegistrations = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, event.id))

    if (event.maxAttendees && existingRegistrations.length >= event.maxAttendees) {
      return NextResponse.json(
        { error: "Event is full" },
        { status: 400 }
      )
    }

    // Check if already registered
    const existingRegistration = existingRegistrations.find(
      (reg) => reg.email.toLowerCase() === email.toLowerCase()
    )

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 400 }
      )
    }

    // Get user ID if logged in
    const session = await auth()
    const userId = session?.user?.id ? parseInt(session.user.id) : null

    // Create registration
    const [registration] = await db
      .insert(eventRegistrations)
      .values({
        eventId: event.id,
        userId: userId || undefined,
        name,
        email,
        phone: phone || null,
        status: "registered",
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        registration: {
          id: registration.id,
          eventId: registration.eventId,
          name: registration.name,
          email: registration.email,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error registering for event:", error)
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const eventSlug = searchParams.get("eventSlug")

    if (eventSlug) {
      // Get registrations for a specific event (admin only)
      if (session.user?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.slug, eventSlug))
        .limit(1)

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      const registrations = await db
        .select()
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, event.id))

      return NextResponse.json({ registrations })
    } else {
      // Get user's registrations
      const userId = parseInt(session.user.id!)
      const registrations = await db
        .select({
          registration: eventRegistrations,
          event: events,
        })
        .from(eventRegistrations)
        .innerJoin(events, eq(eventRegistrations.eventId, events.id))
        .where(eq(eventRegistrations.userId, userId))

      return NextResponse.json({ registrations })
    }
  } catch (error: any) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    )
  }
}

