"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, Eye, EyeOff } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  textlocalApiKey?: string
  textlocalSenderId?: string
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
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/sms/config")
      if (!response.ok) {
        throw new Error("Failed to fetch SMS config")
      }
      const data = await response.json()
      
      // Populate form with current config
      setSettings({
        otpLength: 6,
        otpExpiryMinutes: 10,
        maxAttemptsPerWindow: 3,
        rateLimitWindowMinutes: 15,
        smsProvider: data.providerType || "demo",
        twilioAccountSid: data.config.twilioAccountSid || "",
        twilioPhoneNumber: data.config.twilioPhoneNumber || "",
        msg91AuthKey: data.config.msg91AuthKey || "",
        msg91SenderId: data.config.msg91SenderId || "",
        textlocalApiKey: data.config.textlocalApiKey || "",
        textlocalSenderId: data.config.textlocalSenderId || "",
      })
    } catch (error) {
      console.error("Error fetching SMS config:", error)
      toast({
        title: "Error",
        description: "Failed to load SMS configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Validate based on provider type
      if (settings.smsProvider === "twilio") {
        if (!settings.twilioAccountSid || !settings.twilioAuthToken || !settings.twilioPhoneNumber) {
          toast({
            title: "Error",
            description: "Twilio requires Account SID, Auth Token, and Phone Number",
            variant: "destructive",
          })
          setSaving(false)
          return
        }
      }

      if (settings.smsProvider === "msg91") {
        if (!settings.msg91AuthKey || !settings.msg91SenderId) {
          toast({
            title: "Error",
            description: "MSG91 requires Auth Key and Sender ID",
            variant: "destructive",
          })
          setSaving(false)
          return
        }
      }

      if (settings.smsProvider === "textlocal") {
        if (!settings.textlocalApiKey || !settings.textlocalSenderId) {
          toast({
            title: "Error",
            description: "TextLocal requires API Key and Sender ID",
            variant: "destructive",
          })
          setSaving(false)
          return
        }
      }

      const response = await fetch("/api/sms/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerType: settings.smsProvider,
          twilioAccountSid: settings.smsProvider === "twilio" ? settings.twilioAccountSid : undefined,
          twilioAuthToken: settings.smsProvider === "twilio" ? settings.twilioAuthToken : undefined,
          twilioPhoneNumber: settings.smsProvider === "twilio" ? settings.twilioPhoneNumber : undefined,
          msg91AuthKey: settings.smsProvider === "msg91" ? settings.msg91AuthKey : undefined,
          msg91SenderId: settings.smsProvider === "msg91" ? settings.msg91SenderId : undefined,
          textlocalApiKey: settings.smsProvider === "textlocal" ? settings.textlocalApiKey : undefined,
          textlocalSenderId: settings.smsProvider === "textlocal" ? settings.textlocalSenderId : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save configuration")
      }

      toast({
        title: "Success",
        description: "SMS provider configuration saved successfully",
      })

      // Refresh config
      await fetchConfig()
    } catch (error: any) {
      console.error("Error saving SMS config:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save SMS configuration",
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
            <Select
              value={settings.smsProvider}
              onValueChange={(value) => setSettings({ ...settings, smsProvider: value })}
            >
              <SelectTrigger id="smsProvider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="demo">Demo (Console Log)</SelectItem>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="msg91">MSG91</SelectItem>
                <SelectItem value="textlocal">TextLocal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select your SMS service provider. Database settings take precedence over environment variables.
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
                <div className="relative">
                  <Input
                    id="twilioAuthToken"
                    type={showTokens.twilio ? "text" : "password"}
                    value={settings.twilioAuthToken || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, twilioAuthToken: e.target.value })
                    }
                    placeholder="Your auth token"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowTokens({ ...showTokens, twilio: !showTokens.twilio })}
                  >
                    {showTokens.twilio ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
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
                <div className="relative">
                  <Input
                    id="msg91AuthKey"
                    type={showTokens.msg91 ? "text" : "password"}
                    value={settings.msg91AuthKey || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, msg91AuthKey: e.target.value })
                    }
                    placeholder="Your MSG91 auth key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowTokens({ ...showTokens, msg91: !showTokens.msg91 })}
                  >
                    {showTokens.msg91 ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
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

          {settings.smsProvider === "textlocal" && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="textlocalApiKey">TextLocal API Key</Label>
                <div className="relative">
                  <Input
                    id="textlocalApiKey"
                    type={showTokens.textlocal ? "text" : "password"}
                    value={settings.textlocalApiKey || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, textlocalApiKey: e.target.value })
                    }
                    placeholder="Your TextLocal API key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowTokens({ ...showTokens, textlocal: !showTokens.textlocal })}
                  >
                    {showTokens.textlocal ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://www.textlocal.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    textlocal.in
                  </a>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="textlocalSenderId">TextLocal Sender ID</Label>
                <Input
                  id="textlocalSenderId"
                  type="text"
                  value={settings.textlocalSenderId || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, textlocalSenderId: e.target.value })
                  }
                  placeholder="SENDERID"
                />
                <p className="text-xs text-muted-foreground">
                  Your registered sender ID (6 characters max)
                </p>
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

