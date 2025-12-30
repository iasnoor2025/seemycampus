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

  const getGradientForPackage = (index: number, isPopular: boolean) => {
    if (isPopular) {
      return "from-blue-500 to-indigo-600"
    }
    const gradients = [
      "from-blue-500 to-cyan-600",
      "from-indigo-500 to-purple-600",
      "from-violet-500 to-purple-600",
    ]
    return gradients[index % gradients.length]
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg, index) => {
          const isPopular = pkg.name.toLowerCase() === "premium" || pkg.name.toLowerCase() === "vip"
          const gradient = getGradientForPackage(index, isPopular)
          
          return (
            <Card
              key={pkg.id}
              className={`flex flex-col border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                isPopular ? "ring-2 ring-blue-500 ring-offset-2" : ""
              }`}
            >
              {isPopular && (
                <div className={`bg-gradient-to-r ${gradient} text-white text-center py-3 rounded-t-lg`}>
                  <Badge className="bg-white text-blue-600 font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className={`bg-gradient-to-br ${gradient} text-white rounded-t-lg ${!isPopular ? "rounded-t-lg" : ""}`}>
                <CardTitle className="text-white text-2xl font-bold text-center mb-2">{pkg.name}</CardTitle>
                {pkg.description && (
                  <CardDescription className="text-white/90 text-center">
                    {pkg.description}
                  </CardDescription>
                )}
                <div className="mt-4 text-center">
                  <span className="text-4xl font-bold text-white">{formatPrice(pkg.price, pkg.currency)}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {pkg.duration} minutes per session
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {pkg.sessions} session{pkg.sessions > 1 ? "s" : ""} included
                    </span>
                  </div>
                  {pkg.features && pkg.features.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-900">Features:</p>
                      <ul className="space-y-2">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  className={`w-full font-semibold shadow-md hover:shadow-lg transition-all ${
                    isPopular
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      : "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                  }`}
                  onClick={() => handleBookNow(pkg)}
                >
                  Book Now
                </Button>
              </CardFooter>
            </Card>
          )
        })}
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

