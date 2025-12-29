import { Metadata } from "next"
import { NewsManagement } from "@/components/dashboard/NewsManagement"

export const metadata: Metadata = {
  title: "College News | Admin Dashboard",
  description: "Manage college news and updates",
}

export default function NewsPage() {
  return <NewsManagement />
}

