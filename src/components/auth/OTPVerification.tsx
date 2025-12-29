"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { OTPInput } from "@/components/ui/otp-input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface OTPVerificationProps {
  phone: string
  onVerify: (otp: string) => Promise<void>
  onResend?: () => Promise<void>
  resendCooldown?: number // in seconds
  className?: string
}

export function OTPVerification({
  phone,
  onVerify,
  onResend,
  resendCooldown = 60,
  className,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const { toast } = useToast()

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      await onVerify(otp)
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Invalid OTP. Please try again.",
        variant: "destructive",
      })
      setOtp("") // Clear OTP on error
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || !onResend) return

    setIsResending(true)
    try {
      await onResend()
      setCooldown(resendCooldown)
      setOtp("") // Clear current OTP
      toast({
        title: "OTP sent",
        description: "A new OTP has been sent to your phone number",
      })
    } catch (error) {
      toast({
        title: "Failed to resend",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const formattedPhone = phone.replace(/(\d{2})(\d{4})(\d{4})/, "+91 $1 $2 $3")

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Verify Phone Number</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Enter the 6-digit code sent to {formattedPhone}
          </p>
        </div>

        <OTPInput
          value={otp}
          onChange={setOtp}
          disabled={isVerifying}
          autoFocus
        />

        <Button
          onClick={handleVerify}
          disabled={otp.length !== 6 || isVerifying}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </Button>

        {onResend && (
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <Loader2 className="inline mr-2 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Resend OTP in ${cooldown}s`
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

