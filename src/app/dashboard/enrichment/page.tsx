"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles, CheckCircle2, AlertCircle, Info, RefreshCw, Trash2, Search, Building2, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface RequirementStatus {
  name: string
  status: "ok" | "error"
  message: string
}

export default function EnrichmentPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [requirements, setRequirements] = useState<RequirementStatus[]>([])
  const [checkingRequirements, setCheckingRequirements] = useState(true)
  const [allRequirementsOk, setAllRequirementsOk] = useState(false)
  const [removingDuplicates, setRemovingDuplicates] = useState(false)
  const [duplicateStatus, setDuplicateStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [duplicateMessage, setDuplicateMessage] = useState("")
  const [discoveringColleges, setDiscoveringColleges] = useState(false)
  const [discoveryStatus, setDiscoveryStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [discoveryMessage, setDiscoveryMessage] = useState("")
  const [fullProcess, setFullProcess] = useState(false)
  const [correctingNames, setCorrectingNames] = useState(false)
  const [nameCorrectionStatus, setNameCorrectionStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [nameCorrectionMessage, setNameCorrectionMessage] = useState("")
  const { toast } = useToast()

  const checkRequirements = async () => {
    setCheckingRequirements(true)
    try {
      const response = await fetch("/api/admin/enrich/status")
      const data = await response.json()
      
      if (response.ok && data.requirements) {
        setRequirements(data.requirements)
        setAllRequirementsOk(data.allOk || false)
      } else {
        toast({
          title: "Error",
          description: "Failed to check requirements status",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error checking requirements:", error)
      toast({
        title: "Error",
        description: "Failed to check requirements status",
        variant: "destructive",
      })
    } finally {
      setCheckingRequirements(false)
    }
  }

  useEffect(() => {
    checkRequirements()
    // Refresh every 30 seconds
    const interval = setInterval(checkRequirements, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStartEnrichment = async () => {
    setLoading(true)
    setStatus("running")
    setMessage("Starting enrichment process...")

    try {
      const response = await fetch("/api/admin/enrich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to start enrichment")
      }

      setStatus("success")
      setMessage(data.message || "Enrichment started successfully!")
      
      toast({
        title: "Enrichment Started",
        description: "The enrichment process is running in the background. Check server logs for progress.",
      })
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "An error occurred while starting enrichment")
      
      toast({
        title: "Error",
        description: error.message || "Failed to start enrichment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDuplicates = async () => {
    setRemovingDuplicates(true)
    setDuplicateStatus("running")
    setDuplicateMessage("Starting duplicate removal process...")

    try {
      const response = await fetch("/api/admin/remove-duplicates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to start duplicate removal")
      }

      setDuplicateStatus("success")
      setDuplicateMessage(data.message || "Duplicate removal started successfully!")
      
      toast({
        title: "Duplicate Removal Started",
        description: "The duplicate removal process is running in the background. Check server logs for progress.",
      })
    } catch (error: any) {
      setDuplicateStatus("error")
      setDuplicateMessage(error.message || "An error occurred while starting duplicate removal")
      
      toast({
        title: "Error",
        description: error.message || "Failed to start duplicate removal",
        variant: "destructive",
      })
    } finally {
      setRemovingDuplicates(false)
    }
  }

  const handleDiscoverColleges = async () => {
    setDiscoveringColleges(true)
    setDiscoveryStatus("running")
    setDiscoveryMessage("Starting college discovery process...")

    try {
      const response = await fetch("/api/admin/discover-colleges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullProcess: fullProcess,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to start college discovery")
      }

      setDiscoveryStatus("success")
      setDiscoveryMessage(data.message || "College discovery started successfully!")
      
      toast({
        title: "College Discovery Started",
        description: fullProcess 
          ? "The complete process (discovery, duplicate removal, and enrichment) is running in the background. Check server logs for progress."
          : "The college discovery process is running in the background. Check server logs for progress.",
      })
    } catch (error: any) {
      setDiscoveryStatus("error")
      setDiscoveryMessage(error.message || "An error occurred while starting college discovery")
      
      toast({
        title: "Error",
        description: error.message || "Failed to start college discovery",
        variant: "destructive",
      })
    } finally {
      setDiscoveringColleges(false)
    }
  }

  const handleCorrectNames = async () => {
    setCorrectingNames(true)
    setNameCorrectionStatus("running")
    setNameCorrectionMessage("Starting college name correction process...")

    try {
      const response = await fetch("/api/admin/correct-names", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to start name correction")
      }

      setNameCorrectionStatus("success")
      setNameCorrectionMessage(data.message || "Name correction started successfully!")
      
      toast({
        title: "Name Correction Started",
        description: "The name correction process is running in the background. Check server logs for progress.",
      })
    } catch (error: any) {
      setNameCorrectionStatus("error")
      setNameCorrectionMessage(error.message || "An error occurred while starting name correction")
      
      toast({
        title: "Error",
        description: error.message || "Failed to start name correction",
        variant: "destructive",
      })
    } finally {
      setCorrectingNames(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Data Enrichment</h1>
        <p className="text-muted-foreground">
          Use Ollama AI to automatically enrich college and course data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Enrichment Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Ollama Enrichment
            </CardTitle>
            <CardDescription>
              Automatically fill missing data for colleges and courses using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This process will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Correct college names (fix typos, capitalization, formatting)</li>
                  <li>Fill missing college data (description, ranking, fees, etc.)</li>
                  <li>Add logos (only if college doesn't have one)</li>
                  <li>Add campus images</li>
                  <li>Add courses (if college has none, or add new courses if more are found)</li>
                  <li>Add reviews and ratings (if college has less than 5 reviews)</li>
                </ul>
                <p className="mt-2 font-semibold">⚠️ This may take a while - check server logs for progress.</p>
              </AlertDescription>
            </Alert>

            {status === "success" && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleStartEnrichment}
              disabled={loading || status === "running" || !allRequirementsOk}
              className="w-full"
              size="lg"
            >
              {loading || status === "running" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Enrichment...
                </>
              ) : !allRequirementsOk ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Fix Requirements First
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Enrichment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Understanding the enrichment process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-1">1. Data Enrichment</h3>
                <p className="text-sm text-muted-foreground">
                  Uses Ollama AI to find and fill missing college information like descriptions, rankings, fees, and contact details.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">2. Image Enrichment</h3>
                <p className="text-sm text-muted-foreground">
                  Finds official logos and campus images. Only adds logos if the college doesn't already have one.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">3. Course Enrichment</h3>
                <p className="text-sm text-muted-foreground">
                  If a college has no courses, adds all found courses. If a college already has courses, searches for additional courses and adds any new ones found online.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">4. Reviews & Ratings Enrichment</h3>
                <p className="text-sm text-muted-foreground">
                  Generates realistic student reviews and ratings for colleges. Only adds reviews if a college has less than 5 reviews. Reviews cover academics, infrastructure, placements, campus life, and faculty.
                </p>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>SEO Safe:</strong> This process only adds missing data. It never modifies existing data or changes URLs/slugs.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* College Discovery Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Discover & Add Missing Indian Colleges
            </CardTitle>
            <CardDescription>
              Use Ollama AI to find and add missing Indian colleges to the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This process will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Search for well-known Indian colleges using Ollama AI</li>
                  <li>Add colleges that don't exist in the database</li>
                  <li>Include Engineering, Management, Medical, Law, and other colleges</li>
                  {fullProcess && (
                    <>
                      <li>Remove duplicate colleges (keep most complete)</li>
                      <li>Enrich all colleges with missing data</li>
                    </>
                  )}
                </ul>
                <p className="mt-2 font-semibold">⚠️ This may take a while - check server logs for progress.</p>
              </AlertDescription>
            </Alert>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="fullProcess"
                checked={fullProcess}
                onChange={(e) => setFullProcess(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="fullProcess" className="text-sm font-medium">
                Run complete process (Discover → Remove Duplicates → Enrich)
              </label>
            </div>

            {discoveryStatus === "success" && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {discoveryMessage}
                </AlertDescription>
              </Alert>
            )}

            {discoveryStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {discoveryMessage}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleDiscoverColleges}
              disabled={discoveringColleges || discoveryStatus === "running" || !allRequirementsOk}
              className="w-full"
              size="lg"
            >
              {discoveringColleges || discoveryStatus === "running" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Discovering Colleges...
                </>
              ) : !allRequirementsOk ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Fix Requirements First
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Discover & Add Colleges
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Name Correction Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Correct College Names
            </CardTitle>
            <CardDescription>
              Use Ollama AI to correct and standardize college names (fix typos, capitalization, formatting)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This process will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Check all college names for typos and formatting issues</li>
                  <li>Correct spelling errors</li>
                  <li>Fix capitalization (Title Case)</li>
                  <li>Remove extra spaces</li>
                  <li>Update slugs if names change</li>
                </ul>
                <p className="mt-2 font-semibold">⚠️ This may take a while - check server logs for progress.</p>
              </AlertDescription>
            </Alert>

            {nameCorrectionStatus === "success" && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {nameCorrectionMessage}
                </AlertDescription>
              </Alert>
            )}

            {nameCorrectionStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {nameCorrectionMessage}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleCorrectNames}
              disabled={correctingNames || nameCorrectionStatus === "running" || !allRequirementsOk}
              className="w-full"
              size="lg"
            >
              {correctingNames || nameCorrectionStatus === "running" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Correcting Names...
                </>
              ) : !allRequirementsOk ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Fix Requirements First
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Correct College Names
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Duplicate Removal Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Remove Duplicate Colleges
            </CardTitle>
            <CardDescription>
              Find and remove duplicate colleges, keeping only the ones with the most complete data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This process will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Find duplicate colleges (by name and location)</li>
                  <li>Calculate completeness score for each duplicate</li>
                  <li>Keep the college with the highest score (most complete data)</li>
                  <li>Merge courses from duplicates to the kept college</li>
                  <li>Delete duplicate colleges</li>
                </ul>
                <p className="mt-2 font-semibold">⚠️ This action cannot be undone. Check server logs for details.</p>
              </AlertDescription>
            </Alert>

            {duplicateStatus === "success" && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {duplicateMessage}
                </AlertDescription>
              </Alert>
            )}

            {duplicateStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {duplicateMessage}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleRemoveDuplicates}
              disabled={removingDuplicates || duplicateStatus === "running"}
              className="w-full"
              size="lg"
              variant="destructive"
            >
              {removingDuplicates || duplicateStatus === "running" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing Duplicates...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Duplicate Colleges
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Requirements Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Requirements</CardTitle>
                <CardDescription>
                  Make sure these are set up before running enrichment
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkRequirements}
                disabled={checkingRequirements}
              >
                {checkingRequirements ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {checkingRequirements && requirements.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Checking requirements...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      {req.status === "ok" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${req.status === "ok" ? "text-green-700" : "text-red-700"}`}>
                        {req.name}
                      </h4>
                      <p className={`text-sm ${req.status === "ok" ? "text-green-600" : "text-red-600"}`}>
                        {req.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!checkingRequirements && requirements.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                {allRequirementsOk ? (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>All requirements met!</strong> You can now start the enrichment process.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Some requirements are not met.</strong> Please fix the issues above before starting enrichment.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

