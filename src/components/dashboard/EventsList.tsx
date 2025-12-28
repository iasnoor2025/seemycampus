"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, Edit, Trash2, Users, Clock, MapPin, Video, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EventForm } from "./EventForm"
import { format } from "date-fns"

interface Event {
  id: number
  title: string
  slug: string
  type: string
  startDate: string
  endDate: string | null
  registrationDeadline: string | null
  maxAttendees: number | null
  currentAttendees: number
  platform: string | null
  location: string | null
  organizer: string | null
  isActive: boolean
  isPublic: boolean
}

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/events?limit=1000")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await fetch(`/api/events/${slug}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingEvent(null)
    fetchEvents()
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Events & Webinars</h1>
          <p className="text-muted-foreground">Manage events, webinars, and information sessions</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      {showForm && (
        <EventForm event={editingEvent} onClose={handleCloseForm} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Events ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events found. Create your first event!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location/Platform</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="font-medium">{event.title}</div>
                      {event.organizer && (
                        <div className="text-sm text-muted-foreground">by {event.organizer}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{event.type.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.location ? (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      ) : event.platform ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <span>{event.platform}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {event.currentAttendees}
                          {event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {event.isActive ? (
                          <Badge variant="default" className="w-fit">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="w-fit">Inactive</Badge>
                        )}
                        {event.isPublic && (
                          <Badge variant="outline" className="w-fit text-xs">Public</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(event.slug)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

