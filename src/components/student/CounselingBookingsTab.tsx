"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Video, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface CounselingBooking {
  booking: {
    id: number
    name: string
    email: string
    phone: string | null
    preferredDate: string | null
    preferredTime: string | null
    status: string
    paymentStatus: string
    amount: number
    currency: string
    notes: string | null
    sessionLink: string | null
    createdAt: string
  }
  package: {
    id: number
    name: string
    slug: string
    duration: number
    sessions: number
  } | null
  counselor: {
    id: number
    name: string
    email: string
  } | null
}

export function CounselingBookingsTab() {
  const [bookings, setBookings] = useState<CounselingBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/counseling/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-600">Confirmed</Badge>
      case "completed":
        return <Badge variant="default" className="bg-blue-600">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="outline" className="border-green-600 text-green-600">Paid</Badge>
      case "refunded":
        return <Badge variant="outline" className="border-orange-600 text-orange-600">Refunded</Badge>
      default:
        return <Badge variant="outline">Pending Payment</Badge>
    }
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border border-gray-200">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Counseling Bookings Yet
        </h3>
        <p className="text-gray-600 mb-6">
          Book a counseling session to get personalized guidance from our expert counselors.
        </p>
        <Link href="/career-counseling">
          <Button>Browse Counseling Packages</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map(({ booking, package: pkg, counselor }) => (
        <Card key={booking.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">
                  {pkg?.name || "Counseling Package"}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(booking.status)}
                  {getPaymentStatusBadge(booking.paymentStatus)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {formatPrice(booking.amount, booking.currency)}
                </div>
                {pkg && (
                  <div className="text-sm text-muted-foreground">
                    {pkg.sessions} session{pkg.sessions > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booking.preferredDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Preferred Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(booking.preferredDate)}
                      {booking.preferredTime && ` at ${booking.preferredTime}`}
                    </p>
                  </div>
                </div>
              )}

              {counselor && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Counselor</p>
                    <p className="text-sm text-muted-foreground">{counselor.name}</p>
                  </div>
                </div>
              )}

              {pkg && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Session Duration</p>
                    <p className="text-sm text-muted-foreground">{pkg.duration} minutes</p>
                  </div>
                </div>
              )}

              {booking.sessionLink && (
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Session Link</p>
                    <a
                      href={booking.sessionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Join Session
                    </a>
                  </div>
                </div>
              )}
            </div>

            {booking.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-1">Your Notes</p>
                <p className="text-sm text-muted-foreground">{booking.notes}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              Booked on {format(new Date(booking.createdAt), "MMM dd, yyyy 'at' h:mm a")}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

