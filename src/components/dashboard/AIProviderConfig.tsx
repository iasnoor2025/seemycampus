"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Settings, Eye, EyeOff, CheckCircle2, XCircle, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type AIConfig = {
  providerType: string
  provider: string
  configured: boolean
  config: {
    model: string
    ollamaApiUrl: string
    ollamaModel: string
    openrouterModel: string
    openaiModel: string
    customApiUrl: string
    hasCustomApiKey: boolean
    hasOpenrouterApiKey: boolean
    hasOpenaiApiKey: boolean
  }
}

export function AIProviderConfig() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    message: string
    lastTested?: Date
  } | null>(null)

  // Form state
  const [providerType, setProviderType] = useState("custom")
  const [customApiKey, setCustomApiKey] = useState("")
  const [customApiUrl, setCustomApiUrl] = useState("")
  const [customModel, setCustomModel] = useState("")
  const [ollamaApiUrl, setOllamaApiUrl] = useState("http://localhost:11434")
  const [ollamaModel, setOllamaModel] = useState("llama3.2:latest")
  const [openrouterApiKey, setOpenrouterApiKey] = useState("")
  const [openrouterModel, setOpenrouterModel] = useState("openai/gpt-3.5-turbo")
  const [openaiApiKey, setOpenaiApiKey] = useState("")
  const [openaiModel, setOpenaiModel] = useState("gpt-3.5-turbo")

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/ai/config")
      if (!response.ok) {
        throw new Error("Failed to fetch AI config")
      }
      const data = await response.json()
      setConfig(data)
      
      // Populate form with current config
      setProviderType(data.providerType || "custom")
      setOllamaApiUrl(data.config.ollamaApiUrl || "http://localhost:11434")
      setOllamaModel(data.config.ollamaModel || "llama3.2:latest")
      setOpenrouterModel(data.config.openrouterModel || "openai/gpt-3.5-turbo")
      setOpenaiModel(data.config.openaiModel || "gpt-3.5-turbo")
      setCustomApiUrl(data.config.customApiUrl || "")
      setCustomModel(data.config.model || "")
    } catch (error) {
      console.error("Error fetching AI config:", error)
      toast({
        title: "Error",
        description: "Failed to load AI configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validate based on provider type
      if (providerType === "custom" && (!customApiKey || !customApiUrl)) {
        toast({
          title: "Error",
          description: "Custom provider requires API Key and API URL",
          variant: "destructive",
        })
        return
      }

      if (providerType === "openrouter" && !openrouterApiKey) {
        toast({
          title: "Error",
          description: "OpenRouter provider requires API Key",
          variant: "destructive",
        })
        return
      }

      if (providerType === "openai" && !openaiApiKey) {
        toast({
          title: "Error",
          description: "OpenAI provider requires API Key",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/ai/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerType,
          customApiKey: providerType === "custom" ? customApiKey : undefined,
          customApiUrl: providerType === "custom" ? customApiUrl : undefined,
          customModel: providerType === "custom" ? customModel : undefined,
          ollamaApiUrl: providerType === "ollama" ? ollamaApiUrl : undefined,
          ollamaModel: providerType === "ollama" ? ollamaModel : undefined,
          openrouterApiKey: providerType === "openrouter" ? openrouterApiKey : undefined,
          openrouterModel: providerType === "openrouter" ? openrouterModel : undefined,
          openaiApiKey: providerType === "openai" ? openaiApiKey : undefined,
          openaiModel: providerType === "openai" ? openaiModel : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save configuration")
      }

      toast({
        title: "Success",
        description: "AI provider configuration saved successfully",
      })

      // Refresh config
      await fetchConfig()
      
      // Test connection after saving
      await testConnection()
    } catch (error: any) {
      console.error("Error saving AI config:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save AI configuration",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleShowApiKey = (key: string) => {
    setShowApiKeys((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const testConnection = async () => {
    try {
      setTesting(true)
      const response = await fetch("/api/ai/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success && data.connected) {
        setConnectionStatus({
          connected: true,
          message: data.message || "AI provider is connected and working",
          lastTested: new Date(),
        })
        toast({
          title: "Connection Successful",
          description: data.message || "AI provider is working correctly",
        })
      } else {
        setConnectionStatus({
          connected: false,
          message: data.error || "Failed to connect to AI provider",
          lastTested: new Date(),
        })
        toast({
          title: "Connection Failed",
          description: data.error || "Could not connect to AI provider",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error testing connection:", error)
      setConnectionStatus({
        connected: false,
        message: error.message || "Failed to test connection",
        lastTested: new Date(),
      })
      toast({
        title: "Error",
        description: "Failed to test AI connection",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          AI Provider Configuration
        </CardTitle>
        <CardDescription>
          Configure your AI provider settings. Database settings take precedence over environment variables.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="provider-type">AI Provider Type</Label>
          <Select value={providerType} onValueChange={setProviderType}>
            <SelectTrigger id="provider-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom AI Provider</SelectItem>
              <SelectItem value="ollama">Ollama (Local)</SelectItem>
              <SelectItem value="openrouter">OpenRouter</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {providerType === "custom" && "Use a custom AI API endpoint"}
            {providerType === "ollama" && "Use local Ollama instance (make sure Ollama is running)"}
            {providerType === "openrouter" && "Use OpenRouter API (supports multiple models)"}
            {providerType === "openai" && "Use OpenAI API"}
          </p>
        </div>

        {/* Custom Provider Settings */}
        {providerType === "custom" && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium text-sm">Custom Provider Settings</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="custom-api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="custom-api-key"
                    type={showApiKeys.custom ? "text" : "password"}
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="Enter API key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleShowApiKey("custom")}
                  >
                    {showApiKeys.custom ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {config?.config.hasCustomApiKey && !customApiKey && (
                  <p className="text-xs text-muted-foreground">
                    API key is set in environment variables
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-api-url">API URL</Label>
                <Input
                  id="custom-api-url"
                  type="url"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder="https://api.example.com/v1/chat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-model">Model (Optional)</Label>
                <Input
                  id="custom-model"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="default"
                />
              </div>
            </div>
          </div>
        )}

        {/* Ollama Settings */}
        {providerType === "ollama" && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium text-sm">Ollama Settings</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="ollama-api-url">API URL</Label>
                <Input
                  id="ollama-api-url"
                  type="url"
                  value={ollamaApiUrl}
                  onChange={(e) => setOllamaApiUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
                <p className="text-xs text-muted-foreground">
                  Make sure Ollama is running on this URL
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ollama-model">Model</Label>
                <Input
                  id="ollama-model"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.2:latest"
                />
                <p className="text-xs text-muted-foreground">
                  Make sure the model is installed: <code className="text-xs">ollama pull {ollamaModel}</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* OpenRouter Settings */}
        {providerType === "openrouter" && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium text-sm">OpenRouter Settings</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="openrouter-api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="openrouter-api-key"
                    type={showApiKeys.openrouter ? "text" : "password"}
                    value={openrouterApiKey}
                    onChange={(e) => setOpenrouterApiKey(e.target.value)}
                    placeholder="Enter OpenRouter API key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleShowApiKey("openrouter")}
                  >
                    {showApiKeys.openrouter ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {config?.config.hasOpenrouterApiKey && !openrouterApiKey && (
                  <p className="text-xs text-muted-foreground">
                    API key is set in environment variables
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    openrouter.ai/keys
                  </a>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openrouter-model">Model</Label>
                <Input
                  id="openrouter-model"
                  value={openrouterModel}
                  onChange={(e) => setOpenrouterModel(e.target.value)}
                  placeholder="openai/gpt-3.5-turbo"
                />
                <p className="text-xs text-muted-foreground">
                  Examples: openai/gpt-3.5-turbo, anthropic/claude-3-haiku, google/gemini-pro
                </p>
              </div>
            </div>
          </div>
        )}

        {/* OpenAI Settings */}
        {providerType === "openai" && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium text-sm">OpenAI Settings</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="openai-api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="openai-api-key"
                    type={showApiKeys.openai ? "text" : "password"}
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder="Enter OpenAI API key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleShowApiKey("openai")}
                  >
                    {showApiKeys.openai ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {config?.config.hasOpenaiApiKey && !openaiApiKey && (
                  <p className="text-xs text-muted-foreground">
                    API key is set in environment variables
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    platform.openai.com/api-keys
                  </a>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openai-model">Model</Label>
                <Input
                  id="openai-model"
                  value={openaiModel}
                  onChange={(e) => setOpenaiModel(e.target.value)}
                  placeholder="gpt-3.5-turbo"
                />
                <p className="text-xs text-muted-foreground">
                  Examples: gpt-3.5-turbo, gpt-4, gpt-4-turbo-preview
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {connectionStatus && (
          <div className={`p-4 border rounded-lg ${
            connectionStatus.connected 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-start gap-3">
              {connectionStatus.connected ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  connectionStatus.connected ? "text-green-800" : "text-red-800"
                }`}>
                  {connectionStatus.connected ? "Connected & Working" : "Connection Failed"}
                </p>
                <p className={`text-xs mt-1 ${
                  connectionStatus.connected ? "text-green-700" : "text-red-700"
                }`}>
                  {connectionStatus.message}
                </p>
                {connectionStatus.lastTested && (
                  <p className={`text-xs mt-1 ${
                    connectionStatus.connected ? "text-green-600" : "text-red-600"
                  }`}>
                    Last tested: {connectionStatus.lastTested.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave} disabled={saving || testing} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={testConnection} 
            disabled={loading || saving || testing}
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Wifi className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
          <Button variant="outline" onClick={fetchConfig} disabled={loading || saving || testing}>
            Refresh
          </Button>
        </div>

        {/* Info Note */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Database settings take precedence over environment variables. 
            If a setting is configured in the database, it will be used instead of the environment variable.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
