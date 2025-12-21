import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StudentsList } from "@/components/dashboard/StudentsList"

export const metadata: Metadata = {
  title: "Students | Dashboard | SeeMyCampus",
  description: "View student quiz responses in the admin dashboard",
}

export default async function StudentsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Students</h1>
        <p className="text-muted-foreground">
          View student quiz responses and preferences
        </p>
      </div>

      <StudentsList />
    </div>
  )
}

