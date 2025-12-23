import { Metadata } from "next"
import { HeroRotatingTextsList } from "@/components/dashboard/HeroRotatingTextsList"

export const metadata: Metadata = {
  title: "Hero Rotating Texts | Admin Dashboard",
  description: "Manage hero section rotating texts",
}

export default async function HeroRotatingTextsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <HeroRotatingTextsList />
    </div>
  )
}

