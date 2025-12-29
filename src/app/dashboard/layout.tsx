import { Sidebar } from "@/components/dashboard/Sidebar"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  // Check if user is admin
  const userRole = (session.user as any)?.role
  if (userRole !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

