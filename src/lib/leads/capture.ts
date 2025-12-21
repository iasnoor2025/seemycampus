import { db } from "@/db"
import { leads } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { validateLead, type LeadData } from "./validation"

export async function createLead(data: unknown) {
  const validation = validateLead(data)

  if (!validation.success || !validation.data) {
    throw new Error(validation.error || "Invalid lead data")
  }

  const leadData: LeadData = validation.data

  // Check if lead with same email already exists
  const existingLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.email, leadData.email))
    .limit(1)

  if (existingLeads.length > 0) {
    // Update existing lead
    const [updatedLead] = await db
      .update(leads)
      .set({
        name: leadData.name,
        phone: leadData.phone,
        quizData: leadData.quizData,
        studentAnswerId: leadData.studentAnswerId,
        source: leadData.source,
        updatedAt: new Date(),
      })
      .where(eq(leads.email, leadData.email))
      .returning()

    return updatedLead
  }

  // Create new lead
  const [newLead] = await db
    .insert(leads)
    .values({
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      quizData: leadData.quizData,
      studentAnswerId: leadData.studentAnswerId,
      source: leadData.source,
      status: "new",
    })
    .returning()

  return newLead
}

export async function getLeadById(id: number) {
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, id))
    .limit(1)

  return lead || null
}

export async function getAllLeads(limit = 100, offset = 0) {
  return await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function updateLeadStatus(id: number, status: string) {
  const [updatedLead] = await db
    .update(leads)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, id))
    .returning()

  return updatedLead
}

