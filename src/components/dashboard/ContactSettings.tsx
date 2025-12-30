"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Save, Loader2, MessageSquare } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

export function ContactSettings() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [popupEnabled, setPopupEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/settings/contact")
      if (response.ok) {
        const data = await response.json()
        setEmail(data.email || "")
        setPhone(data.phone || "")
        setAddress(data.address || "")
        setPopupEnabled(data.popupEnabled !== false) // Default to true if not set
      }
    } catch (error) {
      console.error("Error fetching contact info:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const response = await fetch("/api/settings/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phone,
          address,
          popupEnabled,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Contact information updated successfully!" })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update contact information" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Manage contact details displayed on the contact page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>Manage contact details displayed on the contact page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert className={message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="contact-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              Email Address
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@seemycampus.com"
              className="max-w-md"
            />
            <p className="text-sm text-gray-500">This email will be displayed on the contact page</p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="contact-phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-indigo-600" />
              Phone Number
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91-XXX-XXX-XXXX"
              className="max-w-md"
            />
            <p className="text-sm text-gray-500">Include country code (e.g., +91 for India)</p>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="contact-address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-violet-600" />
              Address
            </Label>
            <Input
              id="contact-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="New Delhi, India"
              className="max-w-md"
            />
            <p className="text-sm text-gray-500">Office location or address</p>
          </div>

          {/* Contact Popup Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex-1">
              <Label htmlFor="contact-popup-enabled" className="flex items-center gap-2 cursor-pointer">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                <span className="text-base font-medium">Contact Popup</span>
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Enable or disable the contact form popup that appears on the website
              </p>
            </div>
            <Switch
              id="contact-popup-enabled"
              checked={popupEnabled}
              onCheckedChange={setPopupEnabled}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

