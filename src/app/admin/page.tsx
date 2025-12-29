import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function AdminPage() {
  const session = await auth()

  // If no session or no user, redirect to signin
  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  // Check if user is admin
  const userRole = (session.user as any)?.role
  if (!userRole || userRole !== "admin") {
    // If not admin, redirect to home
    redirect("/")
  }

  // Redirect to dashboard
  redirect("/dashboard")
}


