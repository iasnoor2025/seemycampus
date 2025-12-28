import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { leads } from "@/db/schema"
import { eq } from "drizzle-orm"
import {
  calculateLeadScore,
  batchScoreLeads,
  getLeadsByPriority,
  predictConversion,
  getOptimalContactTiming,
  type LeadData,
} from "@/lib/analytics/leadScoring"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const leadId = searchParams.get("leadId")
    const action = searchParams.get("action") || "score"

    if (leadId) {
      // Get single lead score
      const [lead] = await db.select().from(leads).where(eq(leads.id, parseInt(leadId))).limit(1)

      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 })
      }

      const leadData: LeadData = {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source || "direct",
        status: lead.status || "new",
        quizData: lead.quizData || null,
        studentAnswerId: lead.studentAnswerId || null,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      }

      switch (action) {
        case "score":
          const score = calculateLeadScore(leadData)
          return NextResponse.json({ score })

        case "conversion":
          const probability = predictConversion(leadData)
          return NextResponse.json({ conversionProbability: probability })

        case "timing":
          const timing = getOptimalContactTiming(leadData)
          return NextResponse.json({ timing })

        default:
          return NextResponse.json({ error: "Invalid action" }, { status: 400 })
      }
    } else {
      // Get all leads with scores
      const allLeads = await db.select().from(leads)

      const leadsData: LeadData[] = allLeads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source || "direct",
        status: lead.status || "new",
        quizData: lead.quizData || null,
        studentAnswerId: lead.studentAnswerId || null,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      }))

      switch (action) {
        case "batch":
          const scores = batchScoreLeads(leadsData)
          return NextResponse.json({ scores })

        case "priority":
          const prioritized = getLeadsByPriority(leadsData)
          return NextResponse.json({ leads: prioritized })

        default:
          const allScores = batchScoreLeads(leadsData)
          return NextResponse.json({ scores: allScores })
      }
    }
  } catch (error: any) {
    console.error("Error in lead scoring:", error)
    return NextResponse.json(
      { error: "Failed to calculate lead scores" },
      { status: 500 }
    )
  }
}

