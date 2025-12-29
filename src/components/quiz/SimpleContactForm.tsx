"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, CheckCircle, AlertCircle, Shield, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SimpleContactFormProps {
  onSuccess?: () => void
}

export function SimpleContactForm({ onSuccess }: SimpleContactFormProps) {
  const [step, setStep] = useState<"form" | "otp">("form")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [otp, setOtp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingOTP, setIsSendingOTP] = useState(false)
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null)
  const [devOTP, setDevOTP] = useState<string | null>(null) // For development mode
  const { toast } = useToast()

  // Check if we're in development mode (client-side)
  const isDevelopment = typeof window !== "undefined" && (
    window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("localhost")
  )

  const saveLead = async () => {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Prepare lead data - store phone without spaces
      const phoneDigits = formData.phone.replace(/\D/g, "")
      const leadData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: phoneDigits || undefined,
        source: "form" as const,
        phoneVerified: true, // Always true since we verify before calling this
        quizData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: phoneDigits,
        },
      }

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit form")
      }

      setSubmitStatus("success")
      toast({
        title: isDevelopment ? "Information saved!" : "Phone verified!",
        description: "Starting quiz...",
      })

      // Store contact form submission status in localStorage
      localStorage.setItem("contactFormSubmitted", "true")
      localStorage.setItem("contactFormEmail", formData.email)
      localStorage.setItem("contactFormPhone", phoneDigits)
      localStorage.setItem("contactFormName", `${formData.firstName} ${formData.lastName}`.trim())

      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 500) // Quick transition
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitStatus("error")
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const checkOTPEnabled = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/feature-flags/feature_otp")
      if (response.ok) {
        const data = await response.json()
        return data.isEnabled !== false // Default to enabled if not found
      }
      return true // Default to enabled on error
    } catch {
      return true // Default to enabled on error
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Skip OTP in development mode - directly save lead
    if (isDevelopment) {
      await saveLead()
      return
    }

    // Check if OTP feature is enabled
    const otpEnabled = await checkOTPEnabled()
    if (!otpEnabled) {
      // OTP is disabled, skip verification and save lead directly
      toast({
        title: "OTP verification disabled",
        description: "Proceeding without phone verification...",
      })
      await saveLead()
      return
    }
    
    setIsSendingOTP(true)
    setOtpError(null)

    try {
      const phoneDigits = formData.phone.replace(/\D/g, "")
      
      const response = await fetch("/api/phone/verify/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phoneDigits }),
      })

      const data = await response.json()

      if (!response.ok) {
        // If OTP is disabled (503), skip verification
        if (response.status === 503 && data.error?.includes("disabled")) {
          toast({
            title: "OTP verification disabled",
            description: "Proceeding without phone verification...",
          })
          await saveLead()
          return
        }
        throw new Error(data.error || "Failed to send OTP")
      }

      setOtpSent(true)
      setStep("otp")
      
      toast({
        title: "OTP Sent!",
        description: "Please check your phone for the verification code.",
      })
    } catch (error) {
      console.error("Send OTP error:", error)
      setOtpError(error instanceof Error ? error.message : "Failed to send OTP")
      toast({
        title: "Failed to send OTP",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingOTP(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifyingOTP(true)
    setOtpError(null)

    try {
      const phoneDigits = formData.phone.replace(/\D/g, "")
      
      const response = await fetch("/api/phone/verify/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phoneDigits, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP")
      }

      // OTP verified, now save the lead
      await saveLead()
    } catch (error) {
      console.error("Verify OTP error:", error)
      setOtpError(error instanceof Error ? error.message : "Invalid OTP")
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Please check your OTP and try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingOTP(false)
    }
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Format phone number for Indian format
    if (name === "phone") {
      // Remove all non-digits
      let digits = value.replace(/\D/g, "")
      
      // Limit to 10 digits
      if (digits.length > 10) {
        digits = digits.slice(0, 10)
      }
      
      // Format as Indian mobile number (XXXXX XXXXX)
      let formatted = digits
      if (digits.length > 5) {
        formatted = `${digits.slice(0, 5)} ${digits.slice(5)}`
      }
      
      setFormData({
        ...formData,
        [name]: formatted,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Validate phone number (should have 10 digits)
  const phoneDigits = formData.phone.replace(/\D/g, "")
  const isPhoneValid = phoneDigits.length === 10 && /^[6-9]/.test(phoneDigits) // Indian mobile starts with 6-9
  
  const isFormValid = 
    formData.firstName.trim() && 
    formData.lastName.trim() && 
    formData.email.trim() && 
    isPhoneValid

  // OTP Verification Step (skip in development)
  if (step === "otp" && !isDevelopment) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setStep("form")
              setOtp("")
              setOtpError(null)
              setOtpSent(false)
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Verify Your Mobile Number</h3>
          </div>
          <p className="text-sm text-blue-700">
            We've sent a 6-digit verification code to <strong>{formData.phone}</strong>
          </p>
          {devOTP && (
            <p className="text-xs text-blue-600 mt-2 font-mono bg-blue-100 p-2 rounded">
              Development Mode OTP: <strong>{devOTP}</strong>
            </p>
          )}
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter Verification Code</Label>
            <Input
              type="text"
              id="otp"
              name="otp"
              placeholder="123456"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                setOtp(value)
                setOtpError(null)
              }}
              className="text-center text-2xl tracking-widest font-mono"
              maxLength={6}
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to your phone</p>
          </div>

          {otpError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{otpError}</span>
            </div>
          )}

          <div className="space-y-2">
            <Button
              type="submit"
              disabled={isVerifyingOTP || isSubmitting || otp.length !== 6}
              size="lg"
              className="w-full"
            >
              {isVerifyingOTP || isSubmitting ? "Verifying..." : "Verify & Start Quiz"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSendOTP}
              disabled={isSendingOTP}
            >
              {isSendingOTP ? "Sending..." : "Resend OTP"}
            </Button>
          </div>
        </form>

        {submitStatus === "success" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span>Phone verified! Starting quiz...</span>
          </div>
        )}
      </div>
    )
  }

  // Contact Form Step
  return (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      {/* Mobile/Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Mobile Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="tel"
            id="phone"
            name="phone"
            placeholder="98765 43210"
            value={formData.phone}
            onChange={handleChange}
            className="pl-10"
            maxLength={11} // 10 digits + 1 space
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">Enter 10-digit mobile number (we'll verify it)</p>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSendingOTP || isSubmitting || !isFormValid}
          size="lg"
          className="w-full"
        >
          {isSendingOTP || isSubmitting 
            ? (isDevelopment ? "Saving..." : "Sending OTP...") 
            : (isDevelopment ? "Start Quiz" : "Send Verification Code")}
        </Button>
      </div>
      
      {isDevelopment && (
        <p className="text-xs text-center text-muted-foreground">
          Development Mode: OTP verification skipped
        </p>
      )}

      {/* Error Messages */}
      {otpError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span>{otpError}</span>
        </div>
      )}
    </form>
  )
}

