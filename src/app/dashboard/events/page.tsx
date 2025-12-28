import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { EventsList } from "@/components/dashboard/EventsList"

export const metadata: Metadata = {
  title: "Events Management | Dashboard | SeeMyCampus",
  description: "Manage events and webinars",
}

export default async function EventsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return <EventsList />
}

