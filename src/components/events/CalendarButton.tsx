"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Download, ExternalLink } from "lucide-react"
import { generateICal, generateGoogleCalendarUrl, generateOutlookCalendarUrl, downloadICalFile } from "@/lib/calendar/calendarUtils"

interface CalendarButtonProps {
  event: {
    title: string
    description: string
    startDate: string
    endDate: string | null
    location?: string | null
    meetingLink?: string | null
  }
}

export function CalendarButton({ event }: CalendarButtonProps) {
  const calendarEvent = {
    title: event.title,
    description: event.description || "",
    startDate: new Date(event.startDate),
    endDate: event.endDate ? new Date(event.endDate) : null,
    location: event.location || undefined,
    meetingLink: event.meetingLink || undefined,
  }

  const handleDownloadICal = () => {
    const icalContent = generateICal(calendarEvent)
    const filename = `${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`
    downloadICalFile(icalContent, filename)
  }

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(calendarEvent)
    window.open(url, "_blank")
  }

  const handleOutlookCalendar = () => {
    const url = generateOutlookCalendarUrl(calendarEvent)
    window.open(url, "_blank")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleDownloadICal}>
          <Download className="mr-2 h-4 w-4" />
          Download .ics file
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleGoogleCalendar}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOutlookCalendar}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Outlook Calendar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

