"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { AIProviderConfig } from "./AIProviderConfig"

type AIStatus = {
  enabled: boolean
  provider: string | null
  configured: boolean
}

export function AISettings() {
  const { toast } = useToast()
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchAIStatus()
  }, [])

  const fetchAIStatus = async () => {
    try {
      setLoading(true)
      
      // Check if AI is enabled
      const enabledResponse = await fetch("/api/feature-flags/ai_enabled")
      const enabledData = await enabledResponse.json()
      
      // Check AI provider configuration
      const configResponse = await fetch("/api/ai/status")
      let provider = null
      let configured = false
      
      if (configResponse.ok) {
        const configData = await configResponse.json()
        provider = configData.provider || null
        configured = configData.configured || false
      }
      
      setAiStatus({
        enabled: enabledData.isEnabled ?? true,
        provider,
        configured,
      })
    } catch (error) {
      console.error("Error fetching AI status:", error)
      setAiStatus({
        enabled: true,
        provider: null,
        configured: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    if (!aiStatus) return

    try {
      setUpdating(true)
      const response = await fetch("/api/feature-flags", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "ai_enabled",
          isEnabled: !aiStatus.enabled,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update AI feature flag")
      }

      const newStatus = !aiStatus.enabled
      setAiStatus({ ...aiStatus, enabled: newStatus })

      toast({
        title: "Success",
        description: `AI features ${newStatus ? "enabled" : "disabled"}`,
      })
    } catch (error) {
      console.error("Error updating AI feature flag:", error)
      toast({
        title: "Error",
        description: "Failed to update AI feature flag",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
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

  if (!aiStatus) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Features
            </CardTitle>
            <CardDescription>
              Enable or disable all AI-powered features across the application
            </CardDescription>
          </div>
          <Badge variant={aiStatus.enabled ? "default" : "secondary"}>
            {aiStatus.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="flex-1">
            <Label htmlFor="ai-enabled" className="text-base font-medium cursor-pointer">
              Enable AI Features
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              When enabled, AI will enhance SEO, recommendations, reviews, blog content, search, and more.
              When disabled, the system will use rule-based fallbacks.
            </p>
          </div>
          <Switch
            id="ai-enabled"
            checked={aiStatus.enabled}
            onCheckedChange={handleToggle}
            disabled={updating}
          />
        </div>

        {/* Status Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            {aiStatus.configured ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">
                  AI Provider: <span className="font-medium text-foreground">{aiStatus.provider || "Custom"}</span>
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-muted-foreground">
                  AI Provider not configured. Configure in environment variables.
                </span>
              </>
            )}
          </div>

          {!aiStatus.enabled && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>AI is currently disabled.</strong> All AI features will use rule-based fallbacks.
              </p>
            </div>
          )}

          {aiStatus.enabled && !aiStatus.configured && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>AI is enabled but not configured.</strong> Configure your AI provider in environment variables
                to use AI features. The system will use rule-based fallbacks until configured.
              </p>
            </div>
          )}

          {aiStatus.enabled && aiStatus.configured && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>AI is enabled and configured.</strong> All AI features are active and will enhance
                SEO, recommendations, reviews, blog content, search, and more.
              </p>
            </div>
          )}
        </div>

        {/* AI Features List */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3">AI Features Included:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              SEO meta description, title, and keyword generation
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Admission predictor reasoning explanations
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              College recommendation explanations
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Review sentiment analysis and summarization
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Blog content generation
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Search query understanding and enhancement
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              College and course description generation
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              College comparison summaries
            </li>
          </ul>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAIStatus}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            "Refresh Status"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// Export both components
export { AIProviderConfig }

