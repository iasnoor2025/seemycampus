import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LeadsList } from "@/components/dashboard/LeadsList"

export const metadata: Metadata = {
  title: "Leads | Dashboard | SeeMyCampus",
  description: "Manage leads in the admin dashboard",
}

export default async function LeadsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Leads Management</h1>
        <p className="text-muted-foreground">
          View and manage student leads from quizzes, contact forms, and other sources
        </p>
      </div>

      <LeadsList />
    </div>
  )
}

