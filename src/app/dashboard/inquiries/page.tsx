import { Metadata } from "next"
import { InquiryManagement } from "@/components/dashboard/InquiryManagement"

export const metadata: Metadata = {
  title: "College Inquiries | Admin Dashboard",
  description: "Manage and respond to student inquiries",
}

export default function InquiriesPage() {
  return <InquiryManagement />
}

