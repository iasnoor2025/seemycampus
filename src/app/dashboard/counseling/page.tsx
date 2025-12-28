import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CounselingManagement } from "@/components/dashboard/CounselingManagement"

export const metadata: Metadata = {
  title: "Counseling Management | Dashboard | SeeMyCampus",
  description: "Manage counseling packages and counselors",
}

export default async function CounselingPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return <CounselingManagement />
}

