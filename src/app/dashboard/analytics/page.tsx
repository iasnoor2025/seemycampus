import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Building2, GraduationCap, FileText, TrendingUp, Calendar, Target } from "lucide-react"
import { db } from "@/db"
import { colleges, courses, leads, studentAnswers } from "@/db/schema"
import { SimpleBarChart, ConversionFunnel } from "@/components/dashboard/AnalyticsCharts"
import { TimeSeriesChart } from "@/components/dashboard/TimeSeriesChart"
import { ExportButton } from "@/components/dashboard/ExportButton"

export const metadata: Metadata = {
  title: "Analytics | Dashboard | SeeMyCampus",
  description: "View analytics and statistics",
}

// Helper to get date N days ago
function getDateNDaysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  // Fetch all data
  const [allColleges, allCourses, allLeads, allStudents] = await Promise.all([
    db.select().from(colleges),
    db.select().from(courses),
    db.select().from(leads),
    db.select().from(studentAnswers),
  ])

  // Calculate basic stats
  const stats = {
    colleges: allColleges.length,
    courses: allCourses.length,
    leads: allLeads.length,
    students: allStudents.length,
    newLeads: allLeads.filter((l) => l.status === "new").length,
    contactedLeads: allLeads.filter((l) => l.status === "contacted").length,
    qualifiedLeads: allLeads.filter((l) => l.status === "qualified").length,
    convertedLeads: allLeads.filter((l) => l.status === "converted").length,
  }

  // Calculate conversion rate
  const conversionRate = stats.leads > 0 
    ? ((stats.convertedLeads / stats.leads) * 100).toFixed(1)
    : "0.0"

  // Lead source breakdown
  const sourceBreakdown = allLeads.reduce((acc, lead) => {
    const source = lead.source || "unknown"
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sourceData = Object.entries(sourceBreakdown).map(([source, count]) => ({
    label: source.charAt(0).toUpperCase() + source.slice(1),
    value: count,
    color: source === "quiz" ? "bg-blue-600" : source === "chat" ? "bg-green-600" : "bg-purple-600",
  }))

  // Status breakdown
  const statusData = [
    { label: "New", value: stats.newLeads, color: "bg-blue-600" },
    { label: "Contacted", value: stats.contactedLeads, color: "bg-yellow-600" },
    { label: "Qualified", value: stats.qualifiedLeads, color: "bg-orange-600" },
    { label: "Converted", value: stats.convertedLeads, color: "bg-green-600" },
  ]

  // Conversion funnel
  const funnelStages = [
    {
      label: "New Leads",
      count: stats.newLeads,
      percentage: 100,
    },
    {
      label: "Contacted",
      count: stats.contactedLeads,
      percentage: stats.newLeads > 0 ? (stats.contactedLeads / stats.newLeads) * 100 : 0,
    },
    {
      label: "Qualified",
      count: stats.qualifiedLeads,
      percentage: stats.newLeads > 0 ? (stats.qualifiedLeads / stats.newLeads) * 100 : 0,
    },
    {
      label: "Converted",
      count: stats.convertedLeads,
      percentage: stats.newLeads > 0 ? (stats.convertedLeads / stats.newLeads) * 100 : 0,
    },
  ]

  // Recent leads (last 7 days)
  const sevenDaysAgo = getDateNDaysAgo(7)
  const recentLeads = allLeads.filter(
    (lead) => new Date(lead.createdAt) >= sevenDaysAgo
  ).length

  // Recent students (last 7 days)
  const recentStudents = allStudents.filter(
    (student) => new Date(student.createdAt) >= sevenDaysAgo
  ).length

  // Time series data for leads (last 30 days)
  const thirtyDaysAgo = getDateNDaysAgo(30)
  const recentLeadsForChart = allLeads.filter(
    (lead) => new Date(lead.createdAt) >= thirtyDaysAgo
  )

  // Group leads by date (last 30 days)
  const leadsByDate: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const date = getDateNDaysAgo(30 - i)
    const dateStr = date.toISOString().split("T")[0]
    leadsByDate[dateStr] = 0
  }

  recentLeadsForChart.forEach((lead) => {
    const dateStr = new Date(lead.createdAt).toISOString().split("T")[0]
    if (leadsByDate[dateStr] !== undefined) {
      leadsByDate[dateStr]++
    }
  })

  const leadsTimeSeries = Object.entries(leadsByDate).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: count,
    label: new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  }))

  // Time series data for quiz submissions (last 30 days)
  const recentStudentsForChart = allStudents.filter(
    (student) => new Date(student.createdAt) >= thirtyDaysAgo
  )

  const studentsByDate: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const date = getDateNDaysAgo(30 - i)
    const dateStr = date.toISOString().split("T")[0]
    studentsByDate[dateStr] = 0
  }

  recentStudentsForChart.forEach((student) => {
    const dateStr = new Date(student.createdAt).toISOString().split("T")[0]
    if (studentsByDate[dateStr] !== undefined) {
      studentsByDate[dateStr]++
    }
  })

  const studentsTimeSeries = Object.entries(studentsByDate).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: count,
    label: new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  }))

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive platform statistics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={allLeads.map(lead => ({
              id: lead.id,
              name: lead.name,
              email: lead.email,
              phone: lead.phone || "",
              source: lead.source || "",
              status: lead.status || "",
              createdAt: new Date(lead.createdAt).toISOString(),
            }))}
            filename="leads"
            label="Export Leads"
          />
        </div>
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
              Active colleges in database
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
              {recentLeads} new in last 7 days
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
              {recentStudents} in last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Conversion Funnel */}
        <ConversionFunnel stages={funnelStages} />

        {/* Lead Sources */}
        <SimpleBarChart
          title="Leads by Source"
          data={sourceData}
          total={stats.leads}
        />
      </div>

      {/* Lead Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SimpleBarChart
          title="Leads by Status"
          data={statusData}
          total={stats.leads}
        />

        {/* Conversion Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Conversion Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Conversion Rate</span>
                  <span className="text-2xl font-bold text-green-600">
                    {conversionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${conversionRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">New → Contacted</p>
                  <p className="text-xl font-bold">
                    {stats.newLeads > 0
                      ? ((stats.contactedLeads / stats.newLeads) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contacted → Qualified</p>
                  <p className="text-xl font-bold">
                    {stats.contactedLeads > 0
                      ? ((stats.qualifiedLeads / stats.contactedLeads) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Qualified → Converted</p>
                  <p className="text-xl font-bold">
                    {stats.qualifiedLeads > 0
                      ? ((stats.convertedLeads / stats.qualifiedLeads) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">New → Converted</p>
                  <p className="text-xl font-bold text-green-600">
                    {conversionRate}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TimeSeriesChart
          title="Leads Over Time (Last 30 Days)"
          data={leadsTimeSeries}
          color="bg-blue-600"
        />
        <TimeSeriesChart
          title="Quiz Submissions Over Time (Last 30 Days)"
          data={studentsTimeSeries}
          color="bg-green-600"
        />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lead Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">New</span>
                <span className="font-semibold">{stats.newLeads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Contacted</span>
                <span className="font-semibold">{stats.contactedLeads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Qualified</span>
                <span className="font-semibold">{stats.qualifiedLeads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Converted</span>
                <span className="font-semibold text-green-600">{stats.convertedLeads}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Colleges</span>
                <span className="font-semibold">{stats.colleges}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Courses</span>
                <span className="font-semibold">{stats.courses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Leads</span>
                <span className="font-semibold">{stats.leads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Quiz Responses</span>
                <span className="font-semibold">{stats.students}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">New Leads</span>
                <span className="font-semibold text-blue-600">{recentLeads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Quiz Submissions</span>
                <span className="font-semibold text-green-600">{recentStudents}</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Track your growth week over week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
