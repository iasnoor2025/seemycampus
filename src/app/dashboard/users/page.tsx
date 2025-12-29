import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UsersList } from "@/components/dashboard/UsersList"

export const metadata: Metadata = {
  title: "Users | Dashboard | SeeMyCampus",
  description: "Manage user approvals in the admin dashboard",
}

export default async function UsersPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  // Check if user is admin
  if ((session.user as any)?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and approve pending registrations
        </p>
      </div>

      <UsersList />
    </div>
  )
}

