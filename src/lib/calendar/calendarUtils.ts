/**
 * Calendar integration utilities
 * Generate iCal and Google Calendar links for events
 */

interface CalendarEvent {
  title: string
  description: string
  startDate: Date
  endDate: Date | null
  location?: string
  meetingLink?: string
}

/**
 * Generate iCal file content for an event
 */
export function generateICal(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000) // Default 1 hour

  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SeeMyCampus//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@seemycampus.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${event.title.replace(/,/g, "\\,")}`,
    `DESCRIPTION:${event.description.replace(/,/g, "\\,").replace(/\n/g, "\\n")}`,
    event.location ? `LOCATION:${event.location.replace(/,/g, "\\,")}` : "",
    event.meetingLink ? `URL:${event.meetingLink}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter((line) => line !== "")
    .join("\r\n")

  return ical
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000)

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatDate(event.startDate)}/${formatDate(endDate)}`,
    details: event.description,
    location: event.location || "",
    sf: "true",
    output: "xml",
  })

  if (event.meetingLink) {
    params.append("add", event.meetingLink)
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate Outlook Calendar URL
 */
export function generateOutlookCalendarUrl(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000)

  const params = new URLSearchParams({
    subject: event.title,
    startdt: formatDate(event.startDate),
    enddt: formatDate(endDate),
    body: event.description,
    location: event.location || "",
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Download iCal file
 */
export function downloadICalFile(icalContent: string, filename: string = "event.ics") {
  const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

