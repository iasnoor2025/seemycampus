"use client"

import { ExamsTimeline } from "@/components/entrance-exams/ExamsTimeline"

export function TimelineTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Admission Timeline</h2>
        <p className="text-sm text-gray-600 mt-1">
          Keep track of important entrance exam dates and registration deadlines.
        </p>
      </div>
      <ExamsTimeline />
    </div>
  )
}

