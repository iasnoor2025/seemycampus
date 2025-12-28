"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, Users, Star, Loader2 } from "lucide-react"
import { CounselingBookingModal } from "@/components/counseling/CounselingBookingModal"

interface CounselingPackage {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  currency: string
  duration: number
  sessions: number
  features: string[]
}

export function CounselingPackagesList() {
  const [packages, setPackages] = useState<CounselingPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<CounselingPackage | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/counseling/packages")
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages || [])
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleBookNow = (packageData: CounselingPackage) => {
    setSelectedPackage(packageData)
    setShowBookingModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`flex flex-col ${
              pkg.name.toLowerCase() === "premium" || pkg.name.toLowerCase() === "vip"
                ? "border-2 border-primary shadow-lg"
                : ""
            }`}
          >
            {pkg.name.toLowerCase() === "premium" || pkg.name.toLowerCase() === "vip" ? (
              <div className="bg-primary text-primary-foreground text-center py-2">
                <Badge variant="secondary" className="bg-white text-primary">
                  Most Popular
                </Badge>
              </div>
            ) : null}
            <CardHeader>
              <CardTitle className="text-2xl">{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{formatPrice(pkg.price, pkg.currency)}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    {pkg.duration} minutes per session
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    {pkg.sessions} session{pkg.sessions > 1 ? "s" : ""} included
                  </span>
                </div>
                {pkg.features && pkg.features.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Features:</p>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleBookNow(pkg)}
                variant={pkg.name.toLowerCase() === "premium" || pkg.name.toLowerCase() === "vip" ? "default" : "outline"}
              >
                Book Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {showBookingModal && selectedPackage && (
        <CounselingBookingModal
          packageData={selectedPackage}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedPackage(null)
          }}
        />
      )}
    </>
  )
}

