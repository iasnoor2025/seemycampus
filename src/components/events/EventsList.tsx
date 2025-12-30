"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Video, ExternalLink, Loader2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Event {
  id: number
  title: string
  slug: string
  description: string | null
  type: string
  startDate: string
  endDate: string | null
  registrationDeadline: string | null
  maxAttendees: number | null
  currentAttendees: number
  platform: string | null
  meetingLink: string | null
  location: string | null
  organizer: string | null
  imageUrl: string | null
  tags: string[]
}

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    fetchEvents()
  }, [filter])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const url = filter === "all" 
        ? "/api/events?upcoming=true" 
        : `/api/events?upcoming=true&type=${filter}`
      const response = await fetch(url)
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  const isRegistrationOpen = (event: Event) => {
    if (!event.registrationDeadline) return true
    return new Date(event.registrationDeadline) > new Date()
  }

  const isEventFull = (event: Event) => {
    if (!event.maxAttendees) return false
    return event.currentAttendees >= event.maxAttendees
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Events
        </Button>
        <Button
          variant={filter === "webinar" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("webinar")}
        >
          Webinars
        </Button>
        <Button
          variant={filter === "workshop" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("workshop")}
        >
          Workshops
        </Button>
        <Button
          variant={filter === "info_session" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("info_session")}
        >
          Info Sessions
        </Button>
        <Button
          variant={filter === "office" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("office")}
        >
          Office
        </Button>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No upcoming events at this time.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon for new events and webinars!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow flex flex-col">
              {event.imageUrl && (
                <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {event.type.replace("_", " ")}
                  </Badge>
                </div>
                {event.organizer && (
                  <p className="text-sm text-muted-foreground">by {event.organizer}</p>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
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
                  ) : null}
                  {event.maxAttendees && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.currentAttendees} / {event.maxAttendees} registered
                      </span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {event.description}
                  </p>
                )}

                <div className="mt-auto space-y-2">
                  {isEventFull(event) ? (
                    <Badge variant="destructive" className="w-full justify-center">
                      Event Full
                    </Badge>
                  ) : !isRegistrationOpen(event) ? (
                    <Badge variant="secondary" className="w-full justify-center">
                      Registration Closed
                    </Badge>
                  ) : (
                    <Link href={`/events/${event.slug}`} className="block">
                      <Button className="w-full">View Details & Register</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

