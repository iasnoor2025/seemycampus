"use client"

import { useState, useEffect } from "react"
import { Users, Mail, Phone, Calendar, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface EventAttendee {
  id: number
  eventId: number
  userId: number | null
  name: string
  email: string
  phone: string | null
  status: string
  reminderSent: boolean
  attended: boolean
  createdAt: string
  updatedAt: string
}

interface EventAttendeesProps {
  eventSlug: string
  eventTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventAttendees({ eventSlug, eventTitle, open, onOpenChange }: EventAttendeesProps) {
  const [attendees, setAttendees] = useState<EventAttendee[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && eventSlug) {
      fetchAttendees()
    }
  }, [open, eventSlug])

  const fetchAttendees = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/register?eventSlug=${eventSlug}`)
      if (response.ok) {
        const data = await response.json()
        setAttendees(data.registrations || [])
      }
    } catch (error) {
      console.error("Error fetching attendees:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Attendees
          </DialogTitle>
          <DialogDescription>
            {eventTitle} - {attendees.length} {attendees.length === 1 ? "attendee" : "attendees"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : attendees.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No attendees registered for this event yet.
          </div>
        ) : (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((attendee) => (
                  <TableRow key={attendee.id}>
                    <TableCell className="font-medium">{attendee.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{attendee.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {attendee.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{attendee.phone}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={
                            attendee.status === "registered"
                              ? "default"
                              : attendee.status === "attended"
                              ? "default"
                              : "secondary"
                          }
                          className="w-fit"
                        >
                          {attendee.status}
                        </Badge>
                        {attendee.attended && (
                          <Badge variant="outline" className="w-fit text-xs">
                            Attended
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(attendee.createdAt)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

