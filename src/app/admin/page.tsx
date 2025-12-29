import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  // Check if user is admin
  const userRole = (session.user as any)?.role
  if (userRole !== "admin") {
    redirect("/")
  }

  // Redirect to dashboard
  redirect("/dashboard")
}


