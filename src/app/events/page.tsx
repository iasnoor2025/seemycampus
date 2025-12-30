import { Metadata } from "next"
import { EventsList } from "@/components/events/EventsList"
import { Calendar, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Events & Webinars | SeeMyCampus",
  description: "Join our upcoming events, webinars, and information sessions to learn more about colleges and admissions.",
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 shadow-lg">
              <Calendar className="w-5 h-5" />
              <span className="font-medium text-sm">Upcoming Events</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              Events & Webinars
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join our upcoming events, webinars, and information sessions to learn more about colleges, admissions, and career guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Events Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <EventsList />
        </div>
      </section>
    </div>
  )
}

