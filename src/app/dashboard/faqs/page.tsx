import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FAQsList } from "@/components/dashboard/FAQsList"

export const metadata: Metadata = {
  title: "Manage FAQs | SeeMyCampus",
  description: "Admin dashboard for managing FAQs",
}

export default async function FAQsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  // Check if user is admin
  const userRole = (session.user as any)?.role
  if (userRole !== "admin") {
    redirect("/")
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage FAQs</h1>
        <p className="text-gray-600">
          Review and approve FAQs before they appear on the home page
        </p>
      </div>

      <FAQsList />
    </div>
  )
}
