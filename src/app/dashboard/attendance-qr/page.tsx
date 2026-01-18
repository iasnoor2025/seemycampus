import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DailyQRCode } from "@/components/dashboard/DailyQRCode"

export const metadata: Metadata = {
  title: "Daily QR Code | Dashboard | SeeMyCampus",
  description: "View and manage the daily attendance QR code",
}

export default async function AttendanceQRPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  const userRole = (session.user as any)?.role || "student"

  // Allow both admins and employees to access
  if (userRole !== "admin" && userRole !== "employee") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Daily Attendance QR Code</h1>
          <p className="text-muted-foreground mb-2">
            Display this QR code at the office entrance. All employees scan the same QR code.
            First scan = Check-In, subsequent scans = Check-Out.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Public URL:</strong> <a href="/attendance-qr" className="text-blue-600 hover:underline" target="_blank">/attendance-qr</a> (accessible without login)
          </p>
        </div>

        <DailyQRCode />
      </div>
    </div>
  )
}
