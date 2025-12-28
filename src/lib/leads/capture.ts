import { db } from "@/db"
import { leads } from "@/db/schema"
import { eq, desc, or } from "drizzle-orm"
import { validateLead, type LeadData } from "./validation"

export async function createLead(data: unknown) {
  const validation = validateLead(data)

  if (!validation.success || !validation.data) {
    throw new Error(validation.error || "Invalid lead data")
  }

  const leadData: LeadData = validation.data

  // Check if lead with same email or phone already exists
  // Also check for anonymous quiz leads that might match by phone
  const existingLeads = await db
    .select()
    .from(leads)
    .where(
      leadData.phone
        ? or(
            eq(leads.email, leadData.email),
            eq(leads.phone, leadData.phone)
          )
        : eq(leads.email, leadData.email)
    )
    .limit(1)

  if (existingLeads.length > 0) {
    const existingLead = existingLeads[0]
    
    // Merge quiz data if both exist
    let mergedQuizData = existingLead.quizData || {}
    if (leadData.quizData) {
      mergedQuizData = {
        ...mergedQuizData,
        ...leadData.quizData,
      }
    }
    
    // Update existing lead - merge data intelligently
    const [updatedLead] = await db
      .update(leads)
      .set({
        // Use real name if available, otherwise keep existing
        name: leadData.name !== "Anonymous" ? leadData.name : existingLead.name,
        // Use real email if available, otherwise keep existing
        email: !leadData.email.includes("quiz_") ? leadData.email : existingLead.email,
        // Use phone if provided and existing doesn't have it
        phone: leadData.phone || existingLead.phone,
        // Merge quiz data
        quizData: mergedQuizData,
        // Update studentAnswerId if provided
        studentAnswerId: leadData.studentAnswerId || existingLead.studentAnswerId,
        // Update source if it's more specific (form > quiz)
        source: existingLead.source === "form" ? existingLead.source : leadData.source,
        // Keep phoneVerified if already verified
        phoneVerified: existingLead.phoneVerified || leadData.phoneVerified || false,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, existingLead.id))
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
      phoneVerified: leadData.phoneVerified || false,
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

export async function getLeadByEmail(email: string) {
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.email, email))
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

export async function updateLead(id: number, data: Partial<LeadData>) {
  const [updatedLead] = await db
    .update(leads)
    .set({
      name: data.name,
      email: data.email,
      phone: data.phone,
      quizData: data.quizData,
      source: data.source,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, id))
    .returning()

  return updatedLead
}

export async function deleteLead(id: number) {
  const [deletedLead] = await db
    .delete(leads)
    .where(eq(leads.id, id))
    .returning()

  return deletedLead
}

