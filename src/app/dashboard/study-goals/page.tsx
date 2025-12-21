import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { StudyGoalsList } from "@/components/dashboard/StudyGoalsList"

export const metadata: Metadata = {
  title: "Manage Study Goals | Dashboard",
  description: "Manage study goals for the homepage",
}

export default async function StudyGoalsPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Manage Study Goals</h1>
      <StudyGoalsList />
    </div>
  )
}

