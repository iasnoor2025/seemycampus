"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Brain, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function AITraining() {
  const [training, setTraining] = useState(false)
  const [status, setStatus] = useState<"idle" | "training" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const handleTrain = async () => {
    setTraining(true)
    setStatus("training")
    setMessage("Starting AI training with database knowledge...")

    try {
      const response = await fetch("/api/ai/train", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "AI training started successfully!")
        toast({
          title: "Training Started",
          description: "AI training is running in the background. Check server logs for progress.",
        })
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to start training")
        toast({
          title: "Training Failed",
          description: data.error || "Failed to start AI training",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "Failed to start training")
      toast({
        title: "Error",
        description: error.message || "Failed to start AI training",
        variant: "destructive",
      })
    } finally {
      setTraining(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Training
        </CardTitle>
        <CardDescription>
          Train the AI chatbot with knowledge from your database (FAQs, colleges, courses)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Training generates knowledge from your FAQs, colleges, and courses to improve AI responses.
            The chatbot automatically uses this knowledge to provide better answers.
          </AlertDescription>
        </Alert>

        {status === "success" && (
          <Alert className="border-green-200 bg-green-50">
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

        <div className="flex items-center gap-4">
          <Button
            onClick={handleTrain}
            disabled={training || status === "training"}
            className="flex items-center gap-2"
          >
            {training || status === "training" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Training...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Train AI
              </>
            )}
          </Button>

          {status === "success" && (
            <p className="text-sm text-muted-foreground">
              Training runs in background. Check server logs for progress.
            </p>
          )}
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>What gets trained:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Top 100 FAQs (most viewed)</li>
            <li>200 colleges with their information</li>
            <li>100 courses with details</li>
          </ul>
          <p className="mt-2">
            <strong>Note:</strong> The chatbot automatically uses enhanced prompts with this knowledge.
            Training improves response quality over time.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
