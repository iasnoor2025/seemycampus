import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ScholarshipsList } from "@/components/dashboard/ScholarshipsList"

export default async function DashboardScholarshipsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Scholarships</h1>
        <p className="text-muted-foreground mt-2">
          Manage and view all scholarships in the system
        </p>
      </div>
      <ScholarshipsList />
    </div>
  )
}

