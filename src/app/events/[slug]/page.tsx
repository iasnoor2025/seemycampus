import { Metadata } from "next"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Clock, MapPin, Users, Video, ExternalLink, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EventRegistrationForm } from "@/components/events/EventRegistrationForm"
import { CalendarButton } from "@/components/events/CalendarButton"
import { baseUrl } from "@/lib/seo/generateMeta"

interface EventPageProps {
  params: Promise<{ slug: string }>
}

async function getEvent(slug: string) {
  try {
    const response = await fetch(`${baseUrl}/api/events/${slug}`, {
      cache: "no-store",
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.event
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    return {
      title: "Event Not Found",
    }
  }

  return {
    title: `${event.title} | Events | SeeMyCampus`,
    description: event.description || `Join us for ${event.title} on SeeMyCampus.`,
    openGraph: {
      title: event.title,
      description: event.description || "",
      url: `${baseUrl}/events/${slug}`,
    },
    alternates: {
      canonical: `${baseUrl}/events/${slug}`,
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  const isRegistrationOpen = () => {
    if (!event.registrationDeadline) return true
    return new Date(event.registrationDeadline) > new Date()
  }

  const isEventFull = () => {
    if (!event.maxAttendees) return false
    return event.currentAttendees >= event.maxAttendees
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{event.type.replace("_", " ")}</Badge>
                  {event.organizer && (
                    <span className="text-sm text-muted-foreground">
                      by {event.organizer}
                    </span>
                  )}
                </div>
              </div>
              <CalendarButton event={event} />
            </div>
          </div>

          {/* Event Image */}
          {event.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{formatDate(event.startDate)}</p>
                {event.endDate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Ends: {formatDate(event.endDate)}
                  </p>
                )}
              </CardContent>
            </Card>

            {event.location ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{event.location}</p>
                </CardContent>
              </Card>
            ) : event.platform ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{event.platform}</p>
                  {event.meetingLink && (
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      Join Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {event.registrationDeadline && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Registration Deadline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-lg font-semibold ${
                    !isRegistrationOpen() ? "text-red-600" : ""
                  }`}>
                    {formatDate(event.registrationDeadline)}
                  </p>
                </CardContent>
              </Card>
            )}

            {event.maxAttendees && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    {event.currentAttendees} / {event.maxAttendees} registered
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About This Event</h2>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Registration Form */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {isEventFull() ? (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="py-6 text-center">
                  <p className="text-red-800 font-semibold">This event is full.</p>
                  <p className="text-sm text-red-600 mt-1">
                    All available spots have been taken.
                  </p>
                </CardContent>
              </Card>
            ) : !isRegistrationOpen() ? (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="py-6 text-center">
                  <p className="text-gray-800 font-semibold">Registration is closed.</p>
                  <p className="text-sm text-gray-600 mt-1">
                    The registration deadline has passed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <EventRegistrationForm eventSlug={event.slug} />
            )}
          </div>

          {/* Organizer Contact */}
          {event.organizerEmail && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Questions?</h3>
              <p className="text-sm text-muted-foreground">
                Contact the organizer:{" "}
                <a
                  href={`mailto:${event.organizerEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {event.organizerEmail}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

