"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type FeatureFlag = {
  id: number
  key: string
  name: string
  description: string | null
  category: "dashboard" | "public_page" | "feature"
  isEnabled: boolean
}

type FeatureFlagsByCategory = {
  dashboard: FeatureFlag[]
  public_page: FeatureFlag[]
  feature: FeatureFlag[]
}

export function FeatureFlagsManager() {
  const { toast } = useToast()
  const [flags, setFlags] = useState<FeatureFlagsByCategory>({
    dashboard: [],
    public_page: [],
    feature: [],
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchFlags = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/feature-flags")
      if (!response.ok) {
        throw new Error("Failed to fetch feature flags")
      }
      const data = await response.json()
      
      // Group by category
      const grouped: FeatureFlagsByCategory = {
        dashboard: [],
        public_page: [],
        feature: [],
      }
      
      data.flags.forEach((flag: FeatureFlag) => {
        if (grouped[flag.category]) {
          grouped[flag.category].push(flag)
        }
      })
      
      setFlags(grouped)
    } catch (error) {
      console.error("Error fetching feature flags:", error)
      toast({
        title: "Error",
        description: "Failed to load feature flags",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlags()
  }, [])

  const handleToggle = async (key: string, currentValue: boolean) => {
    try {
      setUpdating(key)
      const response = await fetch("/api/feature-flags", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          isEnabled: !currentValue,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update feature flag")
      }

      // Update local state
      const updateFlag = (category: keyof FeatureFlagsByCategory) => {
        setFlags((prev) => ({
          ...prev,
          [category]: prev[category].map((flag) =>
            flag.key === key ? { ...flag, isEnabled: !currentValue } : flag
          ),
        }))
      }

      if (flags.dashboard.some((f) => f.key === key)) {
        updateFlag("dashboard")
      } else if (flags.public_page.some((f) => f.key === key)) {
        updateFlag("public_page")
      } else if (flags.feature.some((f) => f.key === key)) {
        updateFlag("feature")
      }

      toast({
        title: "Success",
        description: `Feature ${!currentValue ? "enabled" : "disabled"}`,
      })
    } catch (error) {
      console.error("Error updating feature flag:", error)
      toast({
        title: "Error",
        description: "Failed to update feature flag",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleInitialize = async () => {
    try {
      setUpdating("init")
      const response = await fetch("/api/feature-flags", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to initialize feature flags")
      }

      toast({
        title: "Success",
        description: "Feature flags initialized. New flags have been added.",
      })
      await fetchFlags()
    } catch (error) {
      console.error("Error initializing feature flags:", error)
      toast({
        title: "Error",
        description: "Failed to initialize feature flags",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
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

  const hasFlags = flags.dashboard.length > 0 || flags.public_page.length > 0 || flags.feature.length > 0

  return (
    <div className="space-y-6">
      {!hasFlags && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No feature flags found. Initialize default feature flags to get started.
              </p>
              <Button
                onClick={handleInitialize}
                disabled={updating === "init"}
              >
                {updating === "init" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Initialize Feature Flags"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {hasFlags && (
        <div className="mb-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Missing a feature flag?
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Click "Initialize Feature Flags" to add any new flags (like OTP Verification) that may have been added.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInitialize}
                  disabled={updating === "init"}
                >
                  {updating === "init" ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    "Initialize Feature Flags"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {hasFlags && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Feature Flags</h2>
              <p className="text-muted-foreground">
                Enable or disable features and pages across the application
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFlags}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Dashboard Pages */}
          {flags.dashboard.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Pages</CardTitle>
                <CardDescription>
                  Control access to admin dashboard pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flags.dashboard.map((flag) => (
                    <div
                      key={flag.key}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <Label htmlFor={flag.key} className="text-base font-medium cursor-pointer">
                          {flag.name}
                        </Label>
                        {flag.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {flag.description}
                          </p>
                        )}
                      </div>
                      <Switch
                        id={flag.key}
                        checked={flag.isEnabled}
                        onCheckedChange={() => handleToggle(flag.key, flag.isEnabled)}
                        disabled={updating === flag.key}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Public Pages */}
          {flags.public_page.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Public Pages</CardTitle>
                <CardDescription>
                  Control visibility of public-facing pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flags.public_page.map((flag) => (
                    <div
                      key={flag.key}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <Label htmlFor={flag.key} className="text-base font-medium cursor-pointer">
                          {flag.name}
                        </Label>
                        {flag.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {flag.description}
                          </p>
                        )}
                      </div>
                      <Switch
                        id={flag.key}
                        checked={flag.isEnabled}
                        onCheckedChange={() => handleToggle(flag.key, flag.isEnabled)}
                        disabled={updating === flag.key}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {flags.feature.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  Enable or disable application features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flags.feature.map((flag) => (
                    <div
                      key={flag.key}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <Label htmlFor={flag.key} className="text-base font-medium cursor-pointer">
                          {flag.name}
                        </Label>
                        {flag.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {flag.description}
                          </p>
                        )}
                      </div>
                      <Switch
                        id={flag.key}
                        checked={flag.isEnabled}
                        onCheckedChange={() => handleToggle(flag.key, flag.isEnabled)}
                        disabled={updating === flag.key}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

