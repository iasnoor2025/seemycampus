import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { siteSettings } from "@/db/schema"
import { eq } from "drizzle-orm"
import { clearSMSConfigCache } from "@/lib/sms/config"

/**
 * GET /api/sms/config
 * Get SMS provider configuration (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get SMS configuration from database
    const allSettings = await db.select().from(siteSettings)
    const configMap: Record<string, string> = {}

    const smsSettings = allSettings.filter(
      (s) =>
        s.category === "sms" ||
        s.key.startsWith("sms_") ||
        s.key.includes("twilio") ||
        s.key.includes("msg91") ||
        s.key.includes("textlocal")
    )

    for (const setting of smsSettings) {
      configMap[setting.key] = setting.value || ""
    }

    // Determine current provider type (database or env)
    const providerType =
      configMap["sms_provider_type"] || process.env.SMS_PROVIDER || "demo"
    let configured = false
    let provider = providerType

    // Check if provider is configured (either in DB or env)
    if (providerType === "twilio") {
      const accountSid =
        configMap["twilio_account_sid"] || process.env.TWILIO_ACCOUNT_SID
      const authToken =
        configMap["twilio_auth_token"] || process.env.TWILIO_AUTH_TOKEN
      const phoneNumber =
        configMap["twilio_phone_number"] || process.env.TWILIO_PHONE_NUMBER
      configured = !!(accountSid && authToken && phoneNumber)
      provider = "Twilio"
    } else if (providerType === "msg91") {
      const authKey = configMap["msg91_auth_key"] || process.env.MSG91_AUTH_KEY
      const senderId =
        configMap["msg91_sender_id"] || process.env.MSG91_SENDER_ID
      configured = !!(authKey && senderId)
      provider = "MSG91"
    } else if (providerType === "textlocal") {
      const apiKey =
        configMap["textlocal_api_key"] || process.env.TEXTLOCAL_API_KEY
      const senderId =
        configMap["textlocal_sender_id"] || process.env.TEXTLOCAL_SENDER_ID
      configured = !!(apiKey && senderId)
      provider = "TextLocal"
    } else {
      configured = true // Demo mode is always "configured"
      provider = "Demo"
    }

    return NextResponse.json({
      providerType,
      provider,
      configured,
      config: {
        // Twilio
        twilioAccountSid:
          configMap["twilio_account_sid"] || process.env.TWILIO_ACCOUNT_SID || "",
        twilioPhoneNumber:
          configMap["twilio_phone_number"] || process.env.TWILIO_PHONE_NUMBER || "",
        hasTwilioAuthToken: !!(
          configMap["twilio_auth_token"] || process.env.TWILIO_AUTH_TOKEN
        ),
        // MSG91
        msg91AuthKey:
          configMap["msg91_auth_key"] || process.env.MSG91_AUTH_KEY || "",
        msg91SenderId:
          configMap["msg91_sender_id"] || process.env.MSG91_SENDER_ID || "",
        // TextLocal
        textlocalApiKey:
          configMap["textlocal_api_key"] || process.env.TEXTLOCAL_API_KEY || "",
        textlocalSenderId:
          configMap["textlocal_sender_id"] || process.env.TEXTLOCAL_SENDER_ID || "",
      },
    })
  } catch (error: any) {
    console.error("Error fetching SMS config:", error)
    return NextResponse.json(
      { error: "Failed to fetch SMS configuration" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/sms/config
 * Update SMS provider configuration (Admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      providerType,
      // Twilio
      twilioAccountSid,
      twilioAuthToken,
      twilioPhoneNumber,
      // MSG91
      msg91AuthKey,
      msg91SenderId,
      // TextLocal
      textlocalApiKey,
      textlocalSenderId,
    } = body

    if (!providerType) {
      return NextResponse.json(
        { error: "Provider type is required" },
        { status: 400 }
      )
    }

    // Prepare settings to update
    const settingsToUpdate: Array<{
      key: string
      value: string
      label: string
      category: string
    }> = []

    // Provider type
    settingsToUpdate.push({
      key: "sms_provider_type",
      value: providerType,
      label: "SMS Provider Type",
      category: "sms",
    })

    // Twilio settings
    if (providerType === "twilio") {
      if (twilioAccountSid) {
        settingsToUpdate.push({
          key: "twilio_account_sid",
          value: twilioAccountSid,
          label: "Twilio Account SID",
          category: "sms",
        })
      }
      if (twilioAuthToken) {
        settingsToUpdate.push({
          key: "twilio_auth_token",
          value: twilioAuthToken,
          label: "Twilio Auth Token",
          category: "sms",
        })
      }
      if (twilioPhoneNumber) {
        settingsToUpdate.push({
          key: "twilio_phone_number",
          value: twilioPhoneNumber,
          label: "Twilio Phone Number",
          category: "sms",
        })
      }
    }

    // MSG91 settings
    if (providerType === "msg91") {
      if (msg91AuthKey) {
        settingsToUpdate.push({
          key: "msg91_auth_key",
          value: msg91AuthKey,
          label: "MSG91 Auth Key",
          category: "sms",
        })
      }
      if (msg91SenderId) {
        settingsToUpdate.push({
          key: "msg91_sender_id",
          value: msg91SenderId,
          label: "MSG91 Sender ID",
          category: "sms",
        })
      }
    }

    // TextLocal settings
    if (providerType === "textlocal") {
      if (textlocalApiKey) {
        settingsToUpdate.push({
          key: "textlocal_api_key",
          value: textlocalApiKey,
          label: "TextLocal API Key",
          category: "sms",
        })
      }
      if (textlocalSenderId) {
        settingsToUpdate.push({
          key: "textlocal_sender_id",
          value: textlocalSenderId,
          label: "TextLocal Sender ID",
          category: "sms",
        })
      }
    }

    // Update or insert settings (upsert pattern)
    for (const setting of settingsToUpdate) {
      try {
        // Try to insert first
        await db.insert(siteSettings).values(setting)
      } catch (error: any) {
        // If duplicate key error (unique constraint violation), update instead
        if (
          error?.code === "23505" ||
          error?.message?.includes("duplicate key") ||
          error?.message?.includes("unique constraint")
        ) {
          // Update existing record
          await db
            .update(siteSettings)
            .set({
              value: setting.value,
              updatedAt: new Date(),
            })
            .where(eq(siteSettings.key, setting.key))
        } else {
          // Re-throw if it's a different error
          throw error
        }
      }
    }

    // Clear config cache so new settings take effect immediately
    clearSMSConfigCache()

    return NextResponse.json({
      success: true,
      message: "SMS configuration updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating SMS config:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update SMS configuration" },
      { status: 500 }
    )
  }
}
