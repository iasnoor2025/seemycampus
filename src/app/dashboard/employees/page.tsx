import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { EmployeesList } from "@/components/dashboard/EmployeesList"

export const metadata: Metadata = {
  title: "Employees | Dashboard | SeeMyCampus",
  description: "Manage employees in the admin dashboard",
}

export default async function EmployeesPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  const userRole = (session.user as any)?.role || "student"

  if (userRole !== "admin") {
    redirect("/")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Employee Management</h1>
        <p className="text-muted-foreground">
          Manage employees for the attendance tracking system. Create, edit, and manage employee accounts and QR codes.
        </p>
      </div>

      <EmployeesList />
    </div>
  )
}
