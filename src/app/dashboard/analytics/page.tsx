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
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader"

export const metadata: Metadata = {
  title: "Analytics | Dashboard | SeeMyCampus",
  description: "View analytics and statistics",
}

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
    const thirtyDaysAgo = getDateNDaysAgo(30)
    const sevenDaysAgo = getDateNDaysAgo(7)

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
      db.select({ count: sql<number>`count(*)` }).from(colleges),
      db.select({ count: sql<number>`count(*)` }).from(courses),
      db.select({ count: sql<number>`count(*)` }).from(leads),
      db.select({ count: sql<number>`count(DISTINCT ${studentAnswers.id})` })
        .from(studentAnswers)
        .innerJoin(leads, eq(studentAnswers.id, leads.studentAnswerId)),
      db.select({ count: sql<number>`count(*)` }).from(leads).where(sql`(${leads.status} = 'new' OR ${leads.status} IS NULL)`),
      db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.status, "contacted")),
      db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.status, "qualified")),
      db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.status, "converted")),
      db.select({ count: sql<number>`count(*)` }).from(leads).where(gte(leads.createdAt, sevenDaysAgo)),
      db.select({ count: sql<number>`count(DISTINCT ${studentAnswers.id})` })
        .from(studentAnswers)
        .innerJoin(leads, eq(studentAnswers.id, leads.studentAnswerId))
        .where(gte(studentAnswers.createdAt, sevenDaysAgo)),
      db.select().from(leads).orderBy(desc(leads.createdAt)),
    ])

    const statsData = {
      colleges: Number(totalCollegesResult[0]?.count || 0),
      courses: Number(totalCoursesResult[0]?.count || 0),
      leads: Number(totalLeadsResult[0]?.count || 0),
      students: Number(totalStudentsWithLeadsResult[0]?.count || 0),
      newLeads: Number(newLeadsResult[0]?.count || 0),
      contactedLeads: Number(contactedLeadsResult[0]?.count || 0),
      qualifiedLeads: Number(qualifiedLeadsResult[0]?.count || 0),
      convertedLeads: Number(convertedLeadsResult[0]?.count || 0),
    }

    const conversionRate = statsData.leads > 0
      ? ((statsData.convertedLeads / statsData.leads) * 100).toFixed(1)
      : "0.0"

    const leadStats = [
      { title: "Total Colleges", value: statsData.colleges, icon: Building2, gradient: "from-blue-500 to-indigo-600" },
      { title: "Active Courses", value: statsData.courses, icon: GraduationCap, gradient: "from-purple-500 to-pink-600" },
      { title: "Platform Leads", value: statsData.leads, icon: FileText, gradient: "from-emerald-500 to-teal-600" },
      { title: "Quiz Responses", value: statsData.students, icon: Users, gradient: "from-amber-500 to-orange-600" }
    ]

    const funnelStages = [
      { label: "New Leads", count: statsData.newLeads, percentage: statsData.newLeads > 0 ? 100 : 0 },
      { label: "Contacted", count: statsData.contactedLeads, percentage: statsData.leads > 0 ? (statsData.contactedLeads / statsData.leads) * 100 : 0 },
      { label: "Qualified", count: statsData.qualifiedLeads, percentage: statsData.leads > 0 ? (statsData.qualifiedLeads / statsData.leads) * 100 : 0 },
      { label: "Converted", count: statsData.convertedLeads, percentage: statsData.leads > 0 ? (statsData.convertedLeads / statsData.leads) * 100 : 0 }
    ]

    return (
      <div className="p-8 lg:p-12 space-y-12">
        <DashboardPageHeader
          title="Insights"
          description="Data-driven intelligence and platform performance metrics."
          breadcrumbs={[{ label: "Analytics" }]}
          icon={BarChart3}
          action={
            <ExportButton
              data={allLeadsForExport.map(lead => ({
                id: lead.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone || "",
                source: lead.source || "",
                status: lead.status || "",
                createdAt: new Date(lead.createdAt).toISOString(),
              }))}
              filename="leads-report"
              label="Generate Report"
            />
          }
        />

        {/* Pro Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-700 hover:-translate-y-2 bg-white rounded-[2rem]"
              >
                <CardContent className="p-8">
                  <div className={`p-3 w-fit rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.title}</h4>
                  <div className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-slate-50">
              <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent className="p-10">
              <ConversionFunnel stages={funnelStages} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Performance Ratio</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Yield % across pipeline stages</CardDescription>
                </div>
                <div className="text-4xl font-black text-emerald-500">{conversionRate}%</div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <div className="space-y-8">
                <div className="w-full bg-slate-100 rounded-full h-4 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg transition-all duration-1000"
                    style={{ width: `${conversionRate}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "New → Contacted", value: statsData.newLeads > 0 ? ((statsData.contactedLeads / statsData.newLeads) * 100).toFixed(1) : "0.0" },
                    { label: "Contacted → Qualified", value: statsData.contactedLeads > 0 ? ((statsData.qualifiedLeads / statsData.contactedLeads) * 100).toFixed(1) : "0.0" },
                    { label: "Qualified → Converted", value: statsData.qualifiedLeads > 0 ? ((statsData.convertedLeads / statsData.qualifiedLeads) * 100).toFixed(1) : "0.0" },
                    { label: "Platform Yield", value: conversionRate }
                  ].map((m, i) => (
                    <div key={i} className="p-6 rounded-[1.5rem] bg-slate-50/50 border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                      <p className="text-xl font-black text-slate-800">{m.value}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading analytics:", error)
    return <div>Error loading analytics</div>
  }
}
