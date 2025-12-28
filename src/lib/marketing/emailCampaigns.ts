/**
 * Marketing automation utilities
 * Foundation for automated email campaigns and notifications
 */

import { db } from "@/db"
import { leads } from "@/db/schema"
import { eq, and, lte } from "drizzle-orm"
import { prepareEmail, type EmailData } from "./emailTemplates"

/**
 * Get leads that need follow-up (created 2+ days ago, status: new)
 */
export async function getLeadsNeedingFollowUp() {
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  return await db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.status, "new"),
        lte(leads.createdAt, twoDaysAgo)
      )
    )
}

/**
 * Get leads ready for conversion email (status: qualified)
 */
export async function getLeadsReadyForConversion() {
  return await db
    .select()
    .from(leads)
    .where(eq(leads.status, "qualified"))
}

/**
 * Prepare welcome emails for new leads
 */
export async function prepareWelcomeEmails(leadIds?: number[]) {
  const query = db.select().from(leads).where(eq(leads.status, "new"))
  
  let newLeads = await query
  if (leadIds && leadIds.length > 0) {
    newLeads = newLeads.filter(lead => leadIds.includes(lead.id))
  }

  return newLeads
    .map((lead) => {
      const email = prepareEmail("welcome", lead.email, lead.name)
      return email ? { ...email, leadId: lead.id } : null
    })
    .filter((email): email is EmailData & { leadId: number } => email !== null)
}

/**
 * Prepare follow-up emails for leads needing attention
 */
export async function prepareFollowUpEmails() {
  const leadsNeedingFollowUp = await getLeadsNeedingFollowUp()

  return leadsNeedingFollowUp
    .map((lead) => {
      // Get college suggestions from quiz data if available
      const collegeSuggestions = lead.quizData?.recommendedColleges
        ? lead.quizData.recommendedColleges
            .slice(0, 3)
            .map((c: any) => `- ${c.name}`)
            .join("\n")
        : ""

      const email = prepareEmail("followUp", lead.email, lead.name, {
        collegeSuggestions: collegeSuggestions || "Explore our college database to find your perfect match!",
      })
      return email ? { ...email, leadId: lead.id } : null
    })
    .filter((email): email is EmailData & { leadId: number } => email !== null)
}

/**
 * Mark lead as emailed (for tracking)
 * Note: This would require adding an 'emailedAt' field to the schema in the future
 */
export async function markLeadAsEmailed(leadId: number) {
  // For now, we can update the lead's updatedAt timestamp
  // In the future, add an 'emailedAt' timestamp field
  await db
    .update(leads)
    .set({ updatedAt: new Date() })
    .where(eq(leads.id, leadId))
}

