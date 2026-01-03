import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, Users, Building2, GraduationCap, FileText, TrendingUp, Calendar, Target, Activity, Sparkles } from "lucide-react"
import { db } from "@/db"
import { colleges, courses, leads, studentAnswers } from "@/db/schema"
import { sql, gte, eq, and, desc } from "drizzle-orm"
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

  try {
    // Calculate date ranges
    const sevenDaysAgo = getDateNDaysAgo(7)
    const thirtyDaysAgo = getDateNDaysAgo(30)

    // Fetch aggregated stats using efficient SQL queries
    const [
      totalCollegesResult,
      totalCoursesResult,
      totalLeadsResult,
      totalStudentsWithLeadsResult,
      newLeadsResult,
      contactedLeadsResult,
      qualifiedLeadsResult,
      convertedLeadsResult,
      recentLeadsResult,
      recentStudentsWithLeadsResult,
      allLeadsForExport,
    ] = await Promise.all([
      // Total counts
      db.select({ count: sql<number>`count(*)` }).from(colleges),
      db.select({ count: sql<number>`count(*)` }).from(courses),
      db.select({ count: sql<number>`count(*)` }).from(leads),
      // Only count quiz responses that have associated leads
      db.select({ count: sql<number>`count(DISTINCT ${studentAnswers.id})` })
        .from(studentAnswers)
        .innerJoin(leads, eq(studentAnswers.id, leads.studentAnswerId)),
      
      // Lead status counts - handle null status (treat as "new" since default is "new")
      db.select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(sql`(${leads.status} = 'new' OR ${leads.status} IS NULL)`),
      db.select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(eq(leads.status, "contacted")),
      db.select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(eq(leads.status, "qualified")),
      db.select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(eq(leads.status, "converted")),
      
      // Recent counts (last 7 days)
      db.select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(gte(leads.createdAt, sevenDaysAgo)),
      // Recent quiz responses with leads (last 7 days)
      db.select({ count: sql<number>`count(DISTINCT ${studentAnswers.id})` })
        .from(studentAnswers)
        .innerJoin(leads, eq(studentAnswers.id, leads.studentAnswerId))
        .where(gte(studentAnswers.createdAt, sevenDaysAgo)),
      
      // All leads for export
      db.select().from(leads).orderBy(desc(leads.createdAt)),
    ])

    // Extract counts
    const stats = {
      colleges: Number(totalCollegesResult[0]?.count || 0),
      courses: Number(totalCoursesResult[0]?.count || 0),
      leads: Number(totalLeadsResult[0]?.count || 0),
      students: Number(totalStudentsWithLeadsResult[0]?.count || 0), // Only quiz responses with leads
      newLeads: Number(newLeadsResult[0]?.count || 0),
      contactedLeads: Number(contactedLeadsResult[0]?.count || 0),
      qualifiedLeads: Number(qualifiedLeadsResult[0]?.count || 0),
      convertedLeads: Number(convertedLeadsResult[0]?.count || 0),
    }

    const recentLeads = Number(recentLeadsResult[0]?.count || 0)
    const recentStudents = Number(recentStudentsWithLeadsResult[0]?.count || 0) // Only quiz responses with leads

    // Fetch leads for source breakdown and time series
    const allLeads = allLeadsForExport
    const allStudents = await db.select().from(studentAnswers)

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
    // Base percentage is 100% for new leads only if there are actually new leads
    // Otherwise, all stages show 0%
    const baseCount = stats.newLeads > 0 ? stats.newLeads : stats.leads
    const funnelStages = [
      {
        label: "New Leads",
        count: stats.newLeads,
        percentage: stats.newLeads > 0 ? 100 : 0,
      },
      {
        label: "Contacted",
        count: stats.contactedLeads,
        percentage: baseCount > 0 ? (stats.contactedLeads / baseCount) * 100 : 0,
      },
      {
        label: "Qualified",
        count: stats.qualifiedLeads,
        percentage: baseCount > 0 ? (stats.qualifiedLeads / baseCount) * 100 : 0,
      },
      {
        label: "Converted",
        count: stats.convertedLeads,
        percentage: baseCount > 0 ? (stats.convertedLeads / baseCount) * 100 : 0,
      },
    ]

    // Time series data for leads (last 30 days)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
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
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
              Total Colleges
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              {stats.colleges}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Active colleges in database
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
              Total Courses
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              {stats.courses}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Available courses
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
              Total Leads
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              {stats.leads}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {recentLeads} new in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
              Quiz Responses
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              {stats.students}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {recentStudents > 0 ? `${recentStudents} in last 7 days` : stats.leads === 0 ? "No leads yet" : "With leads"}
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
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-500" />
              Conversion Metrics
            </CardTitle>
            <CardDescription className="text-slate-600">
              Track conversion rates across funnel stages
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">Overall Conversion Rate</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {conversionRate}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${Math.min(Number(conversionRate), 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <p className="text-xs text-slate-600 mb-1 font-medium">New → Contacted</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.newLeads > 0
                      ? ((stats.contactedLeads / stats.newLeads) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <p className="text-xs text-slate-600 mb-1 font-medium">Contacted → Qualified</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.contactedLeads > 0
                      ? ((stats.qualifiedLeads / stats.contactedLeads) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <p className="text-xs text-slate-600 mb-1 font-medium">Qualified → Converted</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.qualifiedLeads > 0
                      ? ((stats.convertedLeads / stats.qualifiedLeads) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-colors">
                  <p className="text-xs text-emerald-700 mb-1 font-medium">New → Converted</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
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
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Lead Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                <span className="text-sm font-medium text-slate-700">New</span>
                <span className="font-bold text-blue-600 text-lg">{stats.newLeads}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                <span className="text-sm font-medium text-slate-700">Contacted</span>
                <span className="font-bold text-yellow-600 text-lg">{stats.contactedLeads}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                <span className="text-sm font-medium text-slate-700">Qualified</span>
                <span className="font-bold text-orange-600 text-lg">{stats.qualifiedLeads}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                <span className="text-sm font-medium text-slate-700">Converted</span>
                <span className="font-bold text-emerald-600 text-lg">{stats.convertedLeads}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Platform Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm font-medium text-slate-700">Colleges</span>
                <span className="font-bold text-slate-900 text-lg">{stats.colleges}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm font-medium text-slate-700">Courses</span>
                <span className="font-bold text-slate-900 text-lg">{stats.courses}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm font-medium text-slate-700">Total Leads</span>
                <span className="font-bold text-slate-900 text-lg">{stats.leads}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm font-medium text-slate-700">Quiz Responses</span>
                <span className="font-bold text-slate-900 text-lg">{stats.students}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Recent Activity (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <span className="text-sm font-medium">New Leads</span>
                <span className="font-bold text-xl">{recentLeads}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <span className="text-sm font-medium">Quiz Submissions</span>
                <span className="font-bold text-xl">{recentStudents}</span>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-xs text-blue-100">
                  Track your growth week over week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    )
  } catch (error) {
    console.error("Error loading analytics:", error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Comprehensive platform statistics and insights
          </p>
        </div>
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-lg font-semibold text-red-600 mb-2">Error Loading Analytics</p>
              <p className="text-sm text-slate-600">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
