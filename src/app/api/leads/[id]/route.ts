import { NextRequest, NextResponse } from "next/server"
import { getLeadById, updateLeadStatus, updateLead, deleteLead } from "@/lib/leads/capture"
import { validateLead } from "@/lib/leads/validation"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 })
    }

    const lead = await getLeadById(id)

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      lead,
    })
  } catch (error) {
    console.error("Get lead error:", error)
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const updatedLead = await updateLeadStatus(id, status)

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    })
  } catch (error) {
    console.error("Update lead error:", error)
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 })
    }

    const body = await request.json()
    
    // Validate the lead data
    const validation = validateLead(body)
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error || "Invalid lead data" },
        { status: 400 }
      )
    }

    const updatedLead = await updateLead(id, validation.data)

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    })
  } catch (error) {
    console.error("Update lead error:", error)
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 })
    }

    const deletedLead = await deleteLead(id)

    if (!deletedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
      lead: deletedLead,
    })
  } catch (error) {
    console.error("Delete lead error:", error)
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    )
  }
}

