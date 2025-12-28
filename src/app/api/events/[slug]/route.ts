import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { events, eventRegistrations } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.slug, slug), eq(events.isActive, true)))
      .limit(1)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get registration count
    const registrations = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, event.id))

    return NextResponse.json({
      event: {
        ...event,
        currentAttendees: registrations.length,
      },
    })
  } catch (error: any) {
    console.error("Error fetching event:", error)
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()

    const [updatedEvent] = await db
      .update(events)
      .set({
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        registrationDeadline: body.registrationDeadline
          ? new Date(body.registrationDeadline)
          : undefined,
        updatedAt: new Date(),
      })
      .where(eq(events.slug, slug))
      .returning()

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ event: updatedEvent })
  } catch (error: any) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params

    await db
      .update(events)
      .set({ isActive: false })
      .where(eq(events.slug, slug))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    )
  }
}

