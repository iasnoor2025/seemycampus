import { Metadata } from "next"
import { CutoffManagement } from "@/components/dashboard/CutoffManagement"

export const metadata: Metadata = {
  title: "Cutoff Management | Dashboard",
  description: "Manage entrance exam cutoffs for colleges",
}

export default function CutoffsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <CutoffManagement />
    </div>
  )
}

