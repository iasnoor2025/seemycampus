/**
 * SMS Configuration Utility
 * Gets SMS provider configuration from database or environment variables
 */

import { db } from "@/db"
import { siteSettings } from "@/db/schema"

export interface SMSConfig {
  providerType: string
  // Twilio
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioPhoneNumber?: string
  // MSG91
  msg91AuthKey?: string
  msg91SenderId?: string
  // TextLocal
  textlocalApiKey?: string
  textlocalSenderId?: string
}

let configCache: { config: SMSConfig | null; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get SMS configuration from database or environment variables
 * Database settings take precedence over environment variables
 */
export async function getSMSConfig(): Promise<SMSConfig> {
  // Check cache first
  if (configCache && Date.now() - configCache.timestamp < CACHE_DURATION) {
    return configCache.config || getDefaultConfig()
  }

  try {
    // Get all SMS-related settings from database
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

    const config: SMSConfig = {
      providerType:
        configMap["sms_provider_type"] || process.env.SMS_PROVIDER || "demo",
      // Twilio
      twilioAccountSid:
        configMap["twilio_account_sid"] || process.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken:
        configMap["twilio_auth_token"] || process.env.TWILIO_AUTH_TOKEN,
      twilioPhoneNumber:
        configMap["twilio_phone_number"] || process.env.TWILIO_PHONE_NUMBER,
      // MSG91
      msg91AuthKey: configMap["msg91_auth_key"] || process.env.MSG91_AUTH_KEY,
      msg91SenderId: configMap["msg91_sender_id"] || process.env.MSG91_SENDER_ID,
      // TextLocal
      textlocalApiKey:
        configMap["textlocal_api_key"] || process.env.TEXTLOCAL_API_KEY,
      textlocalSenderId:
        configMap["textlocal_sender_id"] || process.env.TEXTLOCAL_SENDER_ID,
    }

    // Cache the config
    configCache = { config, timestamp: Date.now() }
    return config
  } catch (error) {
    console.error("Error fetching SMS config from database:", error)
    // Fall back to environment variables only
    const defaultConfig = getDefaultConfig()
    configCache = { config: defaultConfig, timestamp: Date.now() }
    return defaultConfig
  }
}

/**
 * Get default config from environment variables only
 */
function getDefaultConfig(): SMSConfig {
  return {
    providerType: process.env.SMS_PROVIDER || "demo",
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    msg91AuthKey: process.env.MSG91_AUTH_KEY,
    msg91SenderId: process.env.MSG91_SENDER_ID,
    textlocalApiKey: process.env.TEXTLOCAL_API_KEY,
    textlocalSenderId: process.env.TEXTLOCAL_SENDER_ID,
  }
}

/**
 * Clear the SMS config cache
 * Call this when SMS settings are updated
 */
export function clearSMSConfigCache(): void {
  configCache = null
}
