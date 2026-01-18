"use client"

import { useState, useEffect } from "react"
import { QrCode, Copy, Download, RefreshCw, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { QRCodeSVG } from "qrcode.react"

interface DailyQRCodeProps {
  isPublic?: boolean
}

export function DailyQRCode({ isPublic = false }: DailyQRCodeProps) {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [date, setDate] = useState<string>("")
  const [expiresAt, setExpiresAt] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchDailyQR = async () => {
    try {
      setLoading(true)
      const apiEndpoint = isPublic ? "/api/attendance/daily-qr/public" : "/api/attendance/daily-qr"
      const response = await fetch(apiEndpoint)
      const data = await response.json()

      if (data.success) {
        setQrCodeData(data.qrCode)
        setDate(data.date)
        setExpiresAt(data.expiresAt)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch QR code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching daily QR code:", error)
      toast({
        title: "Error",
        description: "Failed to fetch daily QR code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDailyQR()
    // Refresh every minute to check if new day's QR code is needed
    const interval = setInterval(fetchDailyQR, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleCopy = () => {
    if (qrCodeData) {
      navigator.clipboard.writeText(qrCodeData)
      toast({
        title: "Copied",
        description: "QR code data copied to clipboard",
      })
    }
  }

  const handleDownload = () => {
    const container = document.querySelector('#daily-qr-container')
    const svg = container?.querySelector('svg')
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const link = document.createElement('a')
      link.download = `daily-qr-code-${date}.svg`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
      toast({
        title: "Downloaded",
        description: "QR code downloaded successfully",
      })
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getTimeUntilExpiry = () => {
    if (!expiresAt) return ""
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return "Expired"
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Daily Attendance QR Code</CardTitle>
            <CardDescription>
              {date ? formatDate(date) : "Loading..."}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDailyQR}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : qrCodeData ? (
          <div className="space-y-6">
            {/* QR Code Display */}
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border-2 border-gray-200">
              <div id="daily-qr-container" className="flex justify-center">
                <QRCodeSVG
                  value={qrCodeData}
                  size={320}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="mt-6 text-base font-medium text-center">
                Scan this QR code for attendance
              </p>
              <p className="mt-2 text-sm text-muted-foreground text-center">
                All employees use this same QR code today
              </p>
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Expires In</span>
                </div>
                <p className="text-2xl font-bold">{getTimeUntilExpiry()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  QR code automatically refreshes daily at midnight
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Usage</span>
                </div>
                <p className="text-sm">
                  First scan = Check-In
                </p>
                <p className="text-sm">
                  Subsequent scans = Check-Out
                </p>
              </div>
            </div>

            {/* Actions - Only show for authenticated users (not public) */}
            {!isPublic && (
              <>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Data
                  </Button>
                  <Button onClick={handleDownload} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>

                {/* QR Code Data (Collapsible) */}
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground p-2">
                    View QR Code Data (JSON)
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap break-all">
                      {qrCodeData}
                    </pre>
                  </div>
                </details>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-muted rounded-lg">
            <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Unable to load QR code. Please try again.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
