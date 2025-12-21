import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Building2, GraduationCap, FileText, TrendingUp } from "lucide-react"
import { db } from "@/db"
import { colleges, courses, leads, studentAnswers } from "@/db/schema"

export const metadata: Metadata = {
  title: "Analytics | Dashboard | SeeMyCampus",
  description: "View analytics and statistics",
}

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  // Fetch statistics
  const [collegesCount, coursesCount, leadsCount, studentsCount] = await Promise.all([
    db.select().from(colleges),
    db.select().from(courses),
    db.select().from(leads),
    db.select().from(studentAnswers),
  ])

  const stats = {
    colleges: collegesCount.length,
    courses: coursesCount.length,
    leads: leadsCount.length,
    students: studentsCount.length,
    newLeads: leadsCount.filter((l) => l.status === "new").length,
    convertedLeads: leadsCount.filter((l) => l.status === "converted").length,
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          View platform statistics and insights
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Colleges</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.colleges}</div>
            <p className="text-xs text-muted-foreground">
              Active colleges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses}</div>
            <p className="text-xs text-muted-foreground">
              Available courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newLeads} new, {stats.convertedLeads} converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
            <p className="text-xs text-muted-foreground">
              Student quiz submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Conversion */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lead Conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New Leads</span>
              <span className="text-2xl font-bold text-blue-600">{stats.newLeads}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Converted Leads</span>
              <span className="text-2xl font-bold text-green-600">{stats.convertedLeads}</span>
            </div>
            {stats.leads > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="text-2xl font-bold">
                    {((stats.convertedLeads / stats.leads) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

