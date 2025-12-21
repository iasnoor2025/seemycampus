import { Metadata } from "next"
import { QuizForm } from "@/components/quiz/QuizForm"

export const metadata: Metadata = {
  title: "Quiz Form | SeeMyCampus",
  description: "Answer questions to get personalized college recommendations.",
}

export default function QuizFormPage() {
  return <QuizForm />
}

