import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { HeroSlidesList } from "@/components/dashboard/HeroSlidesList"

export const metadata: Metadata = {
  title: "Hero Slides | Dashboard | SeeMyCampus",
  description: "Manage hero slides for the homepage",
}

export default async function HeroSlidesPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Hero Slides Management</h1>
        <p className="text-muted-foreground">
          Manage the hero section slides displayed on the homepage
        </p>
      </div>

      <HeroSlidesList />
    </div>
  )
}

