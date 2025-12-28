import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prepareWelcomeEmails, prepareFollowUpEmails } from "@/lib/marketing/emailCampaigns"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get emails ready to send
    const [welcomeEmails, followUpEmails] = await Promise.all([
      prepareWelcomeEmails(),
      prepareFollowUpEmails(),
    ])

    return NextResponse.json({
      welcome: welcomeEmails,
      followUp: followUpEmails,
      total: welcomeEmails.length + followUpEmails.length,
    })
  } catch (error: any) {
    console.error("Error preparing email campaigns:", error)
    return NextResponse.json(
      { error: "Failed to prepare email campaigns" },
      { status: 500 }
    )
  }
}

