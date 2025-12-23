import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StudentDashboardClient } from "@/components/student/StudentDashboardClient"

export default async function StudentDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/student/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your saved colleges, view quiz history, and track your recommendations
          </p>
        </div>
        <StudentDashboardClient />
      </div>
    </div>
  )
}

