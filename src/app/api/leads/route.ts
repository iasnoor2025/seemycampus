import { NextRequest, NextResponse } from "next/server"
import { createLead, getAllLeads, getLeadByEmail } from "@/lib/leads/capture"

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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")
    const email = searchParams.get("email")

    // If email is provided, filter by email
    if (email) {
      const lead = await getLeadByEmail(email)
      
      return NextResponse.json({
        success: true,
        leads: lead ? [lead] : [],
        count: lead ? 1 : 0,
      })
    }

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

