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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, TrendingUp, Target, BookOpen, DollarSign, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

interface CareerPath {
  title: string
  description: string
  requiredEducation: string[]
  requiredSkills: string[]
  averageSalary: {
    entry: number
    mid: number
    senior: number
    currency: string
  }
  jobMarketOutlook: "high" | "medium" | "low"
  growthRate: number
  typicalRoles: string[]
  progression: Array<{
    stage: string
    years: string
    roles: string[]
    skills: string[]
    salaryRange: { min: number; max: number; currency: string }
  }>
}

interface SkillGap {
  skill: string
  currentLevel: string
  requiredLevel: string
  gap: number
  resources: string[]
}

interface MarketPrediction {
  field: string
  outlook: "high" | "medium" | "low"
  growthRate: number
  topRoles: string[]
}

interface TimelineItem {
  year: number
  milestones: string[]
  skillsToDevelop: string[]
}

interface CareerSimulation {
  recommendedPaths: CareerPath[]
  skillGaps: SkillGap[]
  marketPredictions: MarketPrediction[]
  timeline: TimelineItem[]
}

export function CareerPathSimulator() {
  const [interests, setInterests] = useState<string[]>([])
  const [currentInterest, setCurrentInterest] = useState("")
  const [currentSkills, setCurrentSkills] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState("")
  const [academicLevel, setAcademicLevel] = useState("")
  const [loading, setLoading] = useState(false)
  const [simulation, setSimulation] = useState<CareerSimulation | null>(null)
  const { toast } = useToast()

  const addInterest = () => {
    if (currentInterest.trim() && !interests.includes(currentInterest.trim())) {
      setInterests([...interests, currentInterest.trim()])
      setCurrentInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest))
  }

  const addSkill = () => {
    if (currentSkill.trim() && !currentSkills.includes(currentSkill.trim())) {
      setCurrentSkills([...currentSkills, currentSkill.trim()])
      setCurrentSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setCurrentSkills(currentSkills.filter((s) => s !== skill))
  }

  const handleSimulate = async () => {
    if (interests.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one interest field.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/ai/career-path", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interests: interests.map((field) => ({ field, level: "beginner" })),
          currentSkills,
          academicLevel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate simulation")
      }

      setSimulation(data.simulation)
      toast({
        title: "Success",
        description: "Career path simulation generated successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate simulation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatSalary = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getOutlookColor = (outlook: string) => {
    switch (outlook) {
      case "high":
        return "bg-green-100 text-green-800 border-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "low":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Career Path Simulator</CardTitle>
          <CardDescription>
            Discover your ideal career path based on your interests and skills
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="interests">Your Interests *</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="interests"
                value={currentInterest}
                onChange={(e) => setCurrentInterest(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addInterest()
                  }
                }}
                placeholder="e.g., Computer Science, Business, Medicine..."
              />
              <Button type="button" onClick={addInterest}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="skills">Current Skills (Optional)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="skills"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addSkill()
                  }
                }}
                placeholder="e.g., Python, JavaScript, Communication..."
              />
              <Button type="button" onClick={addSkill} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="academicLevel">Academic Level (Optional)</Label>
            <Select value={academicLevel || undefined} onValueChange={(value: string | null) => setAcademicLevel(value || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select your academic level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
                <SelectItem value="diploma">Diploma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSimulate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Simulation...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Simulate Career Path
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {simulation && (
        <div className="space-y-6">
          {/* Recommended Career Paths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recommended Career Paths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {simulation.recommendedPaths.map((path, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{path.title}</CardTitle>
                        <CardDescription className="mt-1">{path.description}</CardDescription>
                      </div>
                      <Badge className={getOutlookColor(path.jobMarketOutlook)}>
                        {path.jobMarketOutlook.toUpperCase()} Demand
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Average Salary</p>
                        <div className="space-y-1 text-sm">
                          <p>
                            Entry: {formatSalary(path.averageSalary.entry, path.averageSalary.currency)}
                          </p>
                          <p>
                            Mid: {formatSalary(path.averageSalary.mid, path.averageSalary.currency)}
                          </p>
                          <p>
                            Senior: {formatSalary(path.averageSalary.senior, path.averageSalary.currency)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Market Growth</p>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{path.growthRate}% growth rate</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Required Education</p>
                      <div className="flex flex-wrap gap-2">
                        {path.requiredEducation.map((edu, i) => (
                          <Badge key={i} variant="outline">
                            {edu}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {path.requiredSkills.map((skill, i) => (
                          <Badge key={i} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Career Progression</p>
                      <div className="space-y-3">
                        {path.progression.map((stage, i) => (
                          <div key={i} className="border-l-2 border-l-gray-300 pl-4">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium">{stage.stage}</p>
                              <span className="text-xs text-muted-foreground">{stage.years}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {stage.roles.join(", ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatSalary(stage.salaryRange.min, stage.salaryRange.currency)} -{" "}
                              {formatSalary(stage.salaryRange.max, stage.salaryRange.currency)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Skill Gaps */}
          {simulation.skillGaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Skill Gap Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {simulation.skillGaps.map((gap, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{gap.skill}</p>
                        <Badge variant="outline">{gap.gap}% gap</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>Current: {gap.currentLevel}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span>Required: {gap.requiredLevel}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gap.resources.map((resource, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Job Market Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {simulation.marketPredictions.map((prediction, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{prediction.field}</p>
                      <Badge className={getOutlookColor(prediction.outlook)}>
                        {prediction.outlook.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{prediction.growthRate}% growth rate</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Top Roles:</p>
                      <div className="flex flex-wrap gap-2">
                        {prediction.topRoles.map((role, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Career Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Career Progression Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {simulation.timeline.map((item, index) => (
                  <div key={index} className="border-l-4 border-l-blue-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <p className="font-medium">Year {item.year}</p>
                    </div>
                    <div className="ml-10 space-y-2">
                      <div>
                        <p className="text-sm font-medium mb-1">Milestones:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {item.milestones.map((milestone, i) => (
                            <li key={i}>{milestone}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Skills to Develop:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.skillsToDevelop.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

