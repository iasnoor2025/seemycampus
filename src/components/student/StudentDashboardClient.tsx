"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SavedCollegesTab } from "./SavedCollegesTab"
import { QuizHistoryTab } from "./QuizHistoryTab"
import { RecommendationsTab } from "./RecommendationsTab"
import { Loader2 } from "lucide-react"

export function StudentDashboardClient() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="saved" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="saved">Saved Colleges</TabsTrigger>
        <TabsTrigger value="quiz">Quiz History</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
      </TabsList>

      <TabsContent value="saved" className="mt-6">
        <SavedCollegesTab />
      </TabsContent>

      <TabsContent value="quiz" className="mt-6">
        <QuizHistoryTab />
      </TabsContent>

      <TabsContent value="recommendations" className="mt-6">
        <RecommendationsTab />
      </TabsContent>
    </Tabs>
  )
}

