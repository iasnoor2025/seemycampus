import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { CollegesList } from "@/components/dashboard/CollegesList"
import { getAllColleges } from "@/lib/colleges"

export const metadata: Metadata = {
  title: "Colleges | Dashboard | SeeMyCampus",
  description: "Manage colleges in the admin dashboard",
}

export default async function CollegesPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  const allColleges = await getAllColleges()
  const totalColleges = allColleges.length
  const academicAllianceColleges = allColleges.filter(
    (c) => c.isAcademicAlliance
  ).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Colleges</h1>
        <p className="text-muted-foreground">
          Manage and view all colleges in the system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Colleges</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalColleges}</div>
            <p className="text-xs text-muted-foreground">
              All colleges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalColleges}</div>
            <p className="text-xs text-muted-foreground">
              Active colleges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Building2 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partners</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicAllianceColleges}</div>
            <p className="text-xs text-muted-foreground">
              Partner colleges
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Colleges List */}
      <Card>
        <CardHeader>
          <CardTitle>All Colleges</CardTitle>
          <CardDescription>
            A list of all colleges in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CollegesList />
        </CardContent>
      </Card>
    </div>
  )
}
