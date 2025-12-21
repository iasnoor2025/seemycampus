import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { CoursesList } from "@/components/dashboard/CoursesList"
import { db } from "@/db"
import { courses } from "@/db/schema"

export const metadata: Metadata = {
  title: "Courses | Dashboard | SeeMyCampus",
  description: "Manage courses in the admin dashboard",
}

export default async function CoursesPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  const allCourses = await db.select().from(courses)
  const totalCourses = allCourses.length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Courses</h1>
        <p className="text-muted-foreground">
          Manage and view all courses in the system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              All courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Undergraduate</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allCourses.filter((c) => c.level === "undergraduate").length}
            </div>
            <p className="text-xs text-muted-foreground">
              UG courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graduate</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allCourses.filter((c) => c.level === "graduate").length}
            </div>
            <p className="text-xs text-muted-foreground">
              PG courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allCourses.filter((c) => c.studyMode === "online").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Online courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            A list of all courses in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CoursesList />
        </CardContent>
      </Card>
    </div>
  )
}

