import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db/index"
import { siteSettings } from "@/db/schema"
import { eq } from "drizzle-orm"

// GET - Fetch contact information
export async function GET() {
  try {
    const contactSettings = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.category, "contact"))

    // Transform to key-value pairs
    const contactInfo: Record<string, string> = {}
    contactSettings.forEach((setting) => {
      contactInfo[setting.key] = setting.value || ""
    })

    // Return with defaults if not set
    const popupEnabled = contactInfo.contact_popup_enabled !== "false" // Default to true if not set
    
    return NextResponse.json({
      email: contactInfo.contact_email || "info@seemycampus.com",
      phone: contactInfo.contact_phone || "+91-XXX-XXX-XXXX",
      address: contactInfo.contact_address || "New Delhi, India",
      popupEnabled: popupEnabled,
    })
  } catch (error: any) {
    console.error("Error fetching contact settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch contact settings" },
      { status: 500 }
    )
  }
}

// PUT - Update contact information (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, phone, address, popupEnabled } = body

    // Update or insert contact settings
    const updates = [
      { key: "contact_email", value: email || "", label: "Contact Email", category: "contact" },
      { key: "contact_phone", value: phone || "", label: "Contact Phone", category: "contact" },
      { key: "contact_address", value: address || "", label: "Contact Address", category: "contact" },
      { key: "contact_popup_enabled", value: popupEnabled === false ? "false" : "true", label: "Contact Popup Enabled", category: "contact" },
    ]

    for (const update of updates) {
      const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, update.key))
        .limit(1)

      if (existing.length > 0) {
        // Update existing
        await db
          .update(siteSettings)
          .set({
            value: update.value,
            updatedAt: new Date(),
          })
          .where(eq(siteSettings.key, update.key))
      } else {
        // Insert new
        await db.insert(siteSettings).values(update)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Contact information updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating contact settings:", error)
    return NextResponse.json(
      { error: "Failed to update contact settings" },
      { status: 500 }
    )
  }
}

