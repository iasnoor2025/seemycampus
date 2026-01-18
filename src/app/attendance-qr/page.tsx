import { Metadata } from "next"
import { DailyQRCode } from "@/components/dashboard/DailyQRCode"

export const metadata: Metadata = {
  title: "Daily Attendance QR Code | SeeMyCampus",
  description: "Scan this QR code for attendance tracking",
}

export default function PublicAttendanceQRPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Daily Attendance QR Code</h1>
          <p className="text-muted-foreground">
            Scan this QR code to record your attendance. All employees use the same QR code.
            First scan = Check-In, subsequent scans = Check-Out.
          </p>
        </div>

        <DailyQRCode isPublic={true} />
      </div>
    </div>
  )
}
