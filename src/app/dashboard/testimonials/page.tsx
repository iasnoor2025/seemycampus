import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { TestimonialsList } from "@/components/dashboard/TestimonialsList"

export const metadata: Metadata = {
  title: "Manage Testimonials | Dashboard",
  description: "Manage testimonials for the homepage",
}

export default async function TestimonialsPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Manage Testimonials</h1>
      <TestimonialsList />
    </div>
  )
}

