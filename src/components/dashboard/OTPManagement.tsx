"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, CheckCircle2, XCircle, Clock } from "lucide-react"

interface OTPRecord {
  id: number
  phone: string
  otp: string
  verified: boolean
  expiresAt: string
  createdAt: string
}

export function OTPManagement() {
  const [otps, setOtps] = useState<OTPRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchPhone, setSearchPhone] = useState("")
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all")
  const { toast } = useToast()

  const fetchOTPs = async (phone?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (phone) params.set("phone", phone)
      if (filterVerified !== "all") params.set("verified", filterVerified === "verified" ? "true" : "false")

      const response = await fetch(`/api/dashboard/otp?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch OTPs")
      }

      const data = await response.json()
      setOtps(data.otps || [])
    } catch (error) {
      console.error("Error fetching OTPs:", error)
      toast({
        title: "Error",
        description: "Failed to load OTP records",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOTPs()
  }, [filterVerified])

  const handleSearch = () => {
    const phoneDigits = searchPhone.replace(/\D/g, "")
    fetchOTPs(phoneDigits || undefined)
  }

  const formatPhone = (phone: string) => {
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 2)} ${phone.slice(2, 6)} ${phone.slice(6)}`
    }
    return phone
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const verifiedCount = otps.filter((otp) => otp.verified).length
  const unverifiedCount = otps.filter((otp) => !otp.verified).length
  const expiredCount = otps.filter((otp) => isExpired(otp.expiresAt)).length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total OTPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{otps.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unverified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{unverifiedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter OTP records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by phone number..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value as any)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
            <Button variant="outline" onClick={() => fetchOTPs()}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* OTP Table */}
      <Card>
        <CardHeader>
          <CardTitle>OTP Records</CardTitle>
          <CardDescription>
            {otps.length} record{otps.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : otps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No OTP records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone</TableHead>
                    <TableHead>OTP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires At</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otps.map((otp) => (
                    <TableRow key={otp.id}>
                      <TableCell className="font-medium">
                        {formatPhone(otp.phone)}
                      </TableCell>
                      <TableCell className="font-mono">{otp.otp}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {otp.verified ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : isExpired(otp.expiresAt) ? (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Expired
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(otp.expiresAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(otp.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

