import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OTPManagement } from "@/components/dashboard/OTPManagement"

export const metadata: Metadata = {
  title: "OTP Management | Dashboard | SeeMyCampus",
  description: "Manage OTP verifications and statistics",
}

export default async function OTPManagementPage() {
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">OTP Management</h1>
        <p className="text-muted-foreground">
          View and manage OTP verifications
        </p>
      </div>

      <OTPManagement />
    </div>
  )
}

