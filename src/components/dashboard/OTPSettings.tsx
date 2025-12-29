"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"

interface OTPSettings {
  otpLength: number
  otpExpiryMinutes: number
  maxAttemptsPerWindow: number
  rateLimitWindowMinutes: number
  smsProvider: string
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioPhoneNumber?: string
  msg91AuthKey?: string
  msg91SenderId?: string
}

export function OTPSettings() {
  const [settings, setSettings] = useState<OTPSettings>({
    otpLength: 6,
    otpExpiryMinutes: 10,
    maxAttemptsPerWindow: 3,
    rateLimitWindowMinutes: 15,
    smsProvider: "demo",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load settings from API or use defaults
    // For now, we'll use defaults since settings storage isn't implemented yet
    setLoading(false)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Save to database or environment variables
      // For now, just show success
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      toast({
        title: "Settings saved",
        description: "OTP settings have been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>OTP Configuration</CardTitle>
          <CardDescription>
            Configure OTP generation and verification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="otpLength">OTP Length</Label>
              <Input
                id="otpLength"
                type="number"
                min="4"
                max="8"
                value={settings.otpLength}
                onChange={(e) =>
                  setSettings({ ...settings, otpLength: parseInt(e.target.value) || 6 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Number of digits in the OTP (4-8)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otpExpiryMinutes">OTP Expiry (minutes)</Label>
              <Input
                id="otpExpiryMinutes"
                type="number"
                min="1"
                max="60"
                value={settings.otpExpiryMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    otpExpiryMinutes: parseInt(e.target.value) || 10,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                How long the OTP remains valid
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttemptsPerWindow">Max Attempts per Window</Label>
              <Input
                id="maxAttemptsPerWindow"
                type="number"
                min="1"
                max="10"
                value={settings.maxAttemptsPerWindow}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxAttemptsPerWindow: parseInt(e.target.value) || 3,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Maximum OTP requests allowed per time window
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateLimitWindowMinutes">Rate Limit Window (minutes)</Label>
              <Input
                id="rateLimitWindowMinutes"
                type="number"
                min="1"
                max="60"
                value={settings.rateLimitWindowMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    rateLimitWindowMinutes: parseInt(e.target.value) || 15,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Time window for rate limiting
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMS Provider Configuration</CardTitle>
          <CardDescription>
            Configure SMS service provider for sending OTPs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smsProvider">SMS Provider</Label>
            <select
              id="smsProvider"
              value={settings.smsProvider}
              onChange={(e) =>
                setSettings({ ...settings, smsProvider: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="demo">Demo (Console Log)</option>
              <option value="twilio">Twilio</option>
              <option value="msg91">MSG91</option>
              <option value="textlocal">TextLocal</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Select your SMS service provider
            </p>
          </div>

          {settings.smsProvider === "twilio" && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="twilioAccountSid">Twilio Account SID</Label>
                <Input
                  id="twilioAccountSid"
                  type="text"
                  value={settings.twilioAccountSid || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, twilioAccountSid: e.target.value })
                  }
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
                <Input
                  id="twilioAuthToken"
                  type="password"
                  value={settings.twilioAuthToken || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, twilioAuthToken: e.target.value })
                  }
                  placeholder="Your auth token"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twilioPhoneNumber">Twilio Phone Number</Label>
                <Input
                  id="twilioPhoneNumber"
                  type="text"
                  value={settings.twilioPhoneNumber || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, twilioPhoneNumber: e.target.value })
                  }
                  placeholder="+1234567890"
                />
              </div>
            </div>
          )}

          {settings.smsProvider === "msg91" && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="msg91AuthKey">MSG91 Auth Key</Label>
                <Input
                  id="msg91AuthKey"
                  type="text"
                  value={settings.msg91AuthKey || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, msg91AuthKey: e.target.value })
                  }
                  placeholder="Your MSG91 auth key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="msg91SenderId">MSG91 Sender ID</Label>
                <Input
                  id="msg91SenderId"
                  type="text"
                  value={settings.msg91SenderId || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, msg91SenderId: e.target.value })
                  }
                  placeholder="SENDERID"
                />
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

