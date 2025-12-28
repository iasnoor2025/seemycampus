import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllEventsNeedingReminders } from "@/lib/marketing/eventReminders"

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all reminders that need to be sent
    const reminders = await getAllEventsNeedingReminders()

    return NextResponse.json({
      reminders,
      count: reminders.length,
    })
  } catch (error: any) {
    console.error("Error fetching event reminders:", error)
    return NextResponse.json(
      { error: "Failed to fetch event reminders" },
      { status: 500 }
    )
  }
}

