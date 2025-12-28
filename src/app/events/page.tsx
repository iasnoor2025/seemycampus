import { Metadata } from "next"
import { EventsList } from "@/components/events/EventsList"

export const metadata: Metadata = {
  title: "Events & Webinars | SeeMyCampus",
  description: "Join our upcoming events, webinars, and information sessions to learn more about colleges and admissions.",
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Events & Webinars</h1>
          <p className="text-lg text-gray-600">
            Join our upcoming events, webinars, and information sessions to learn more about
            colleges, admissions, and career guidance.
          </p>
        </div>
        <EventsList />
      </div>
    </div>
  )
}

