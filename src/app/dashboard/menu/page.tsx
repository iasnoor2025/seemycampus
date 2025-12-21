import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MenuManager } from "@/components/dashboard/MenuManager"

export const metadata: Metadata = {
  title: "Menu Management | Dashboard | SeeMyCampus",
  description: "Manage navigation menu categories, subcategories, and courses",
}

export default async function MenuPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Menu Management</h1>
        <p className="text-muted-foreground">
          Manage categories, subcategories, and courses for the navigation menu
        </p>
      </div>

      <MenuManager />
    </div>
  )
}

