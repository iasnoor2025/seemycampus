import { Metadata } from "next"
import { ApplicationGuideManagement } from "@/components/dashboard/ApplicationGuideManagement"

export const metadata: Metadata = {
  title: "Application Guides | Admin Dashboard",
  description: "Manage application form guides and requirements",
}

export default function ApplicationGuidesPage() {
  return <ApplicationGuideManagement />
}

