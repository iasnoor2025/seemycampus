import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { leads, users } from "@/db/schema"
import { eq, and, ne, isNull, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { sql } from "drizzle-orm"

const MAX_LEADS_PER_COUNSELOR = 10

// POST - Assign lead(s) to counselor
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
    const { leadId, counselorId, count, status } = body

    // Bulk assignment mode
    if (count && counselorId && !leadId) {
      try {
        return await handleBulkAssignment(counselorId, count, status)
      } catch (error) {
        console.error("Error in bulk assignment:", error)
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        )
      }
    }

    // Single assignment mode (existing logic)
    if (!leadId || !counselorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify counselor exists and has counselor role
    const [counselor] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, counselorId), eq(users.role, "counselor")))
      .limit(1)

    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor not found or invalid role" },
        { status: 404 }
      )
    }

    // Check current active leads count for counselor (not converted)
    const activeLeads = await db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.counselorId, counselorId),
          ne(leads.status, "converted")
        )
      )

    if (activeLeads.length >= MAX_LEADS_PER_COUNSELOR) {
      return NextResponse.json(
        { 
          error: `Counselor already has ${MAX_LEADS_PER_COUNSELOR} active leads. Please finish existing leads before assigning new ones.`,
          currentCount: activeLeads.length,
          maxCount: MAX_LEADS_PER_COUNSELOR
        },
        { status: 400 }
      )
    }

    // Check if lead is already assigned
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1)

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      )
    }

    if (lead.counselorId && lead.counselorId !== counselorId) {
      return NextResponse.json(
        { error: "Lead is already assigned to another counselor" },
        { status: 400 }
      )
    }

    // Assign lead to counselor
    const [updatedLead] = await db
      .update(leads)
      .set({
        counselorId,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId))
      .returning()

    return NextResponse.json({
      message: "Lead assigned successfully",
      lead: updatedLead,
      activeLeadsCount: activeLeads.length + 1,
    })
  } catch (error) {
    console.error("Error assigning lead:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET - Get counselors with their active lead counts
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all counselors
    const counselors = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.role, "counselor"))

    console.log(`Found ${counselors.length} counselors in database`)

    // Get active lead counts for each counselor
    const counselorsWithCounts = await Promise.all(
      counselors.map(async (counselor) => {
        const activeLeads = await db
          .select()
          .from(leads)
          .where(
            and(
              eq(leads.counselorId, counselor.id),
              ne(leads.status, "converted")
            )
          )

        return {
          ...counselor,
          activeLeadsCount: activeLeads.length,
          maxLeads: MAX_LEADS_PER_COUNSELOR,
          canAssignMore: activeLeads.length < MAX_LEADS_PER_COUNSELOR,
        }
      })
    )

    console.log(`Returning ${counselorsWithCounts.length} counselors with counts`)
    return NextResponse.json({ counselors: counselorsWithCounts })
  } catch (error) {
    console.error("Error fetching counselors:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle bulk assignment of random leads to a counselor
async function handleBulkAssignment(counselorId: number, count: number, status?: string) {
  // Validate count
  if (!count || count <= 0 || !Number.isInteger(count)) {
    return NextResponse.json(
      { error: "Count must be a positive integer" },
      { status: 400 }
    )
  }

  // Verify counselor exists and has counselor role
  const [counselor] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, counselorId), eq(users.role, "counselor")))
    .limit(1)

  if (!counselor) {
    return NextResponse.json(
      { error: "Counselor not found or invalid role" },
      { status: 404 }
    )
  }

  // Check current active leads count for counselor (not converted)
  const activeLeads = await db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.counselorId, counselorId),
        ne(leads.status, "converted")
      )
    )

  const availableSlots = MAX_LEADS_PER_COUNSELOR - activeLeads.length

  if (availableSlots <= 0) {
    return NextResponse.json(
      { 
        error: `Counselor already has ${MAX_LEADS_PER_COUNSELOR} active leads. Please finish existing leads before assigning new ones.`,
        currentCount: activeLeads.length,
        maxCount: MAX_LEADS_PER_COUNSELOR
      },
      { status: 400 }
    )
  }

  // Get total unassigned leads count first
  const totalUnassignedLeads = await db
    .select()
    .from(leads)
    .where(
      and(
        isNull(leads.counselorId),
        ne(leads.status, "converted")
      )
    )

  // Determine how many leads we can actually assign
  // Limited by: 1) available slots for counselor, 2) total unassigned leads available
  const leadsToAssign = Math.min(count, availableSlots, totalUnassignedLeads.length)

  if (leadsToAssign <= 0) {
    return NextResponse.json(
      { 
        error: "No leads can be assigned. Either no available slots or no unassigned leads.",
        availableSlots,
        totalUnassigned: totalUnassignedLeads.length
      },
      { status: 400 }
    )
  }

  // Get unassigned leads (no counselorId or counselorId is null, and not converted)
  // Randomly select the requested number
  const unassignedLeads = await db
    .select()
    .from(leads)
    .where(
      and(
        isNull(leads.counselorId),
        ne(leads.status, "converted")
      )
    )
    .orderBy(sql`RANDOM()`)
    .limit(leadsToAssign)

  if (unassignedLeads.length === 0) {
    return NextResponse.json(
      { 
        error: "No unassigned leads available",
        availableSlots,
        totalUnassigned: totalUnassignedLeads.length
      },
      { status: 404 }
    )
  }

  // Validate status if provided
  const validStatuses = ["new", "contacted", "qualified"]
  const assignedStatus = status && validStatuses.includes(status) ? status : "new"
  
  // Assign all selected leads to the counselor with the selected status
  const leadIds = unassignedLeads.map(l => l.id)
  
  // Update all leads with the same status
  const assignedLeads = await db
    .update(leads)
    .set({
      counselorId,
      status: assignedStatus,
      updatedAt: new Date(),
    })
    .where(inArray(leads.id, leadIds))
    .returning()

  const message = count > assignedLeads.length
    ? `Assigned ${assignedLeads.length} of ${count} requested lead(s) to counselor with status "${assignedStatus}". ${count - assignedLeads.length} could not be assigned due to available slots or unassigned leads limit.`
    : `Successfully assigned ${assignedLeads.length} lead(s) to counselor with status "${assignedStatus}"`

  return NextResponse.json({
    message,
    assignedCount: assignedLeads.length,
    requestedCount: count,
    availableSlots,
    totalUnassigned: totalUnassignedLeads.length,
    leads: assignedLeads,
    activeLeadsCount: activeLeads.length + assignedLeads.length,
    assignedStatus: assignedStatus,
  })
}


