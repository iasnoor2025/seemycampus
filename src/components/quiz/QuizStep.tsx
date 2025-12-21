"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface QuizStepProps {
  title: string
  description?: string
  stepNumber: number
  totalSteps: number
  children: React.ReactNode
}

export function QuizStep({ title, description, stepNumber, totalSteps, children }: QuizStepProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>{title}</CardTitle>
          <span className="text-sm text-muted-foreground">
            Step {stepNumber} of {totalSteps}
          </span>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

