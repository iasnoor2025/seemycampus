import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  // Redirect to dashboard
  redirect("/dashboard")
}


