import { z } from "zod"

export const leadSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  source: z.enum(["quiz", "chat", "form", "direct"]).default("direct"),
  phoneVerified: z.boolean().optional(),
  quizData: z.record(z.any()).optional(),
  studentAnswerId: z.number().optional(),
})

export type LeadData = z.infer<typeof leadSchema>

export function validateLead(data: unknown): { success: boolean; data?: LeadData; error?: string } {
  try {
    const validated = leadSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Invalid lead data" }
  }
}

