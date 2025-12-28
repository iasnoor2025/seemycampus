/**
 * Event reminder utilities
 * Integrate with email system to send event reminders
 */

import { db } from "@/db"
import { events, eventRegistrations } from "@/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"
import { prepareEmail } from "../marketing/emailTemplates"

/**
 * Get events happening in the next 24 hours
 */
export async function getUpcomingEventsIn24Hours() {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  return await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.isActive, true),
        gte(events.startDate, now),
        lte(events.startDate, tomorrow)
      )
    )
}

/**
 * Get registrations for an event that haven't received reminders
 */
export async function getRegistrationsNeedingReminder(eventId: number) {
  return await db
    .select()
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.reminderSent, false),
        eq(eventRegistrations.status, "registered")
      )
    )
}

/**
 * Prepare reminder emails for an event
 */
export async function prepareEventReminderEmails(eventId: number) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  if (!event) {
    return []
  }

  const registrations = await getRegistrationsNeedingReminder(eventId)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }

  return registrations
    .map((registration) => {
      const email = prepareEmail("reminder", registration.email, registration.name, {
        examName: event.title,
        deadline: formatDate(new Date(event.startDate)),
        officialWebsite: event.meetingLink || event.location || "",
      })

      return email
        ? {
            ...email,
            registrationId: registration.id,
            eventId: event.id,
          }
        : null
    })
    .filter((email): email is NonNullable<typeof email> & { registrationId: number; eventId: number } => email !== null)
}

/**
 * Mark reminder as sent
 */
export async function markReminderAsSent(registrationId: number) {
  await db
    .update(eventRegistrations)
    .set({
      reminderSent: true,
      updatedAt: new Date(),
    })
    .where(eq(eventRegistrations.id, registrationId))
}

/**
 * Get all events needing reminders (happening in next 24 hours)
 */
export async function getAllEventsNeedingReminders() {
  const upcomingEvents = await getUpcomingEventsIn24Hours()
  const allReminders = []

  for (const event of upcomingEvents) {
    const reminders = await prepareEventReminderEmails(event.id)
    allReminders.push(...reminders)
  }

  return allReminders
}

