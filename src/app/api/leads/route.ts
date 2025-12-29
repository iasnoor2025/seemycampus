import { NextRequest, NextResponse } from "next/server"
import { createLead, getAllLeads, getLeadByEmail } from "@/lib/leads/capture"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const lead = await createLead(body)

    return NextResponse.json(
      {
        success: true,
        lead: {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          source: lead.source,
          status: lead.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Lead creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create lead" },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")
    const email = searchParams.get("email")

    // If email is provided, filter by email
    if (email) {
      const lead = await getLeadByEmail(email)
      
      // If user is counselor, only return if assigned to them
      if (session && (session.user as any)?.role === "counselor") {
        const userId = parseInt((session.user as any)?.id)
        if (lead && lead.counselorId !== userId) {
          return NextResponse.json({
            success: true,
            leads: [],
            count: 0,
          })
        }
      }
      
      return NextResponse.json({
        success: true,
        leads: lead ? [lead] : [],
        count: lead ? 1 : 0,
      })
    }

    // For counselors, only return their assigned leads
    if (session && (session.user as any)?.role === "counselor") {
      const userId = parseInt((session.user as any)?.id)
      const leadsList = await getAllLeads(limit, offset, userId)
      return NextResponse.json({
        success: true,
        leads: leadsList,
        count: leadsList.length,
      })
    }

    // For admins/staff, return all leads
    const leadsList = await getAllLeads(limit, offset)

    return NextResponse.json({
      success: true,
      leads: leadsList,
      count: leadsList.length,
    })
  } catch (error) {
    console.error("Get leads error:", error)
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    )
  }
}

