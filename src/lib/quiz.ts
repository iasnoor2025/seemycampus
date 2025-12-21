import { z } from "zod"

export const quizSchema = z.object({
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  preferredLocation: z.string().min(1, "Location is required"),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  budgetCurrency: z.string().default("INR"),
  studyMode: z.enum(["online", "offline", "hybrid"]),
  academicLevel: z.enum(["high_school", "undergraduate", "graduate", "diploma"]),
})

export type QuizData = z.infer<typeof quizSchema>

export const INTERESTS = [
  "Engineering",
  "Medicine",
  "Business",
  "Arts",
  "Science",
  "Law",
  "Education",
  "Technology",
  "Design",
  "Agriculture",
  "Veterinary",
  "Pharmacy",
]

export const STUDY_MODES = [
  { value: "online", label: "Online" },
  { value: "offline", label: "On-Campus" },
  { value: "hybrid", label: "Hybrid" },
] as const

export const ACADEMIC_LEVELS = [
  { value: "high_school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
  { value: "diploma", label: "Diploma" },
] as const

