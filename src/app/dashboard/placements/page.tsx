import { Metadata } from "next"
import { PlacementManagement } from "@/components/dashboard/PlacementManagement"

export const metadata: Metadata = {
  title: "Placement Management | Dashboard",
  description: "Manage placement statistics for colleges",
}

export default function PlacementsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PlacementManagement />
    </div>
  )
}

