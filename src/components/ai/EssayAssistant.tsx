"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, FileText, CheckCircle, AlertCircle, Copy, Download } from "lucide-react"

export function EssayAssistant() {
  const [essayType, setEssayType] = useState<string>("sop")
  const [topic, setTopic] = useState("")
  const [wordCount, setWordCount] = useState(500)
  const [requirements, setRequirements] = useState("")
  const [userDraft, setUserDraft] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [improvements, setImprovements] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for your essay.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/ai/essay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate",
          type: essayType,
          topic,
          wordCount,
          requirements,
          userDraft: userDraft || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate essay")
      }

      setGeneratedContent(data.essay.content)
      setSuggestions(data.essay.suggestions || [])
      setImprovements(data.essay.improvements || [])
      setActiveTab("result")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate essay",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!userDraft.trim()) {
      toast({
        title: "Error",
        description: "Please enter your essay draft to analyze.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/ai/essay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "analyze",
          content: userDraft,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze essay")
      }

      setSuggestions(data.analysis.styleSuggestions || [])
      setImprovements(
        data.analysis.grammarIssues?.map((issue: any) => issue.suggestion) || []
      )
      toast({
        title: "Analysis Complete",
        description: `Readability Score: ${data.analysis.readabilityScore}/100`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze essay",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGetTemplate = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ai/essay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "template",
          type: essayType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get template")
      }

      setGeneratedContent(data.template)
      setActiveTab("result")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get template",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
    toast({
      title: "Copied!",
      description: "Essay content copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
          <TabsTrigger value="result">Result</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Essay/SOP</CardTitle>
              <CardDescription>
                Get AI-powered assistance for writing essays, SOPs, and personal statements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="essayType">Essay Type *</Label>
                <Select value={essayType} onValueChange={setEssayType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sop">Statement of Purpose (SOP)</SelectItem>
                    <SelectItem value="personal_statement">Personal Statement</SelectItem>
                    <SelectItem value="essay">General Essay</SelectItem>
                    <SelectItem value="cover_letter">Cover Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="topic">Topic/Subject *</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Why I want to pursue MBA, My career goals..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wordCount">Target Word Count</Label>
                  <Input
                    id="wordCount"
                    type="number"
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value) || 500)}
                    min={100}
                    max={5000}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Specific Requirements (Optional)</Label>
                <Textarea
                  id="requirements"
                  rows={3}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Any specific points to include, formatting requirements, etc."
                />
              </div>

              <div>
                <Label htmlFor="userDraft">Your Draft (Optional)</Label>
                <Textarea
                  id="userDraft"
                  rows={6}
                  value={userDraft}
                  onChange={(e) => setUserDraft(e.target.value)}
                  placeholder="Paste your existing draft here for improvement suggestions..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerate} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Essay
                    </>
                  )}
                </Button>
                <Button onClick={handleGetTemplate} variant="outline" disabled={loading}>
                  Get Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyze Your Essay</CardTitle>
              <CardDescription>
                Get grammar, style, and readability analysis for your essay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="analyzeDraft">Your Essay Draft *</Label>
                <Textarea
                  id="analyzeDraft"
                  rows={12}
                  value={userDraft}
                  onChange={(e) => setUserDraft(e.target.value)}
                  placeholder="Paste your essay here for analysis..."
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleAnalyze} disabled={loading || !userDraft.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Analyze Essay
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="result" className="space-y-4">
          {generatedContent && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Content</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {generatedContent}
                </div>
              </CardContent>
            </Card>
          )}

          {suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {!generatedContent && suggestions.length === 0 && improvements.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No content generated yet. Use the Generate or Analyze tabs to get started.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

