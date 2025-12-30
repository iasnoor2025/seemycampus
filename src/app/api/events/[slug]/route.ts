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

    // Only allow updating specific fields
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description
    if (body.type !== undefined) updateData.type = body.type
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null
    if (body.registrationDeadline !== undefined) updateData.registrationDeadline = body.registrationDeadline ? new Date(body.registrationDeadline) : null
    if (body.maxAttendees !== undefined) updateData.maxAttendees = body.maxAttendees || null
    if (body.platform !== undefined) updateData.platform = body.platform || null
    if (body.meetingLink !== undefined) updateData.meetingLink = body.meetingLink || null
    if (body.location !== undefined) updateData.location = body.location || null
    if (body.organizer !== undefined) updateData.organizer = body.organizer || null
    if (body.organizerEmail !== undefined) updateData.organizerEmail = body.organizerEmail || null
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null
    if (body.tags !== undefined) updateData.tags = body.tags || []
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic

    const [updatedEvent] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.slug, slug))
      .returning()

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ event: updatedEvent })
  } catch (error: any) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update event" },
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

