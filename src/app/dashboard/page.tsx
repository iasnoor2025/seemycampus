import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db"
import { colleges, courses, counselors, studentAnswers, leads, users } from "@/db/schema"
import { eq, sql, gte, desc, and, lt } from "drizzle-orm"
import {
  GraduationCap,
  Users,
  Building,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
  FileText,
  Activity,
  Sparkles,
  Zap
} from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard | SeeMyCampus",
  description: "Admin dashboard for SeeMyCampus",
}

// Helper function to format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M+`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K+`
  }
  return `${num}+`
}

// Helper function to calculate percentage change
function calculateTrend(current: number, previous: number): { value: string; isUp: boolean } {
  if (previous === 0) {
    return { value: current > 0 ? "+100%" : "0%", isUp: current > 0 }
  }
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? "+" : ""
  return {
    value: `${sign}${change.toFixed(1)}%`,
    isUp: change >= 0,
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
  }
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  }
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  }
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`
  }
  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  // Check if user is admin
  const userRole = (session.user as any)?.role
  if (userRole !== "admin") {
    redirect("/")
  }

  // Calculate date ranges for trend calculation
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  // Fetch all counts in parallel
  const [
    totalCollegesResult,
    totalCoursesResult,
    totalCounselorsResult,
    totalStudentsResult,
    collegesLast30Days,
    coursesLast30Days,
    counselorsLast30Days,
    studentsLast30Days,
    collegesPrevious30Days,
    coursesPrevious30Days,
    counselorsPrevious30Days,
    studentsPrevious30Days,
  ] = await Promise.all([
    // Current totals
    db.select({ count: sql<number>`count(*)` }).from(colleges),
    db.select({ count: sql<number>`count(*)` }).from(courses),
    db.select({ count: sql<number>`count(*)` }).from(counselors).where(eq(counselors.isActive, true)),
    db.select({
      total: sql<number>`coalesce(sum(${colleges.totalStudents}), 0)`
    }).from(colleges),

    // Last 30 days (current period)
    db.select({ count: sql<number>`count(*)` })
      .from(colleges)
      .where(gte(colleges.createdAt, thirtyDaysAgo)),
    db.select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(gte(courses.createdAt, thirtyDaysAgo)),
    db.select({ count: sql<number>`count(*)` })
      .from(counselors)
      .where(gte(counselors.createdAt, thirtyDaysAgo)),
    db.select({ count: sql<number>`count(*)` })
      .from(studentAnswers)
      .where(gte(studentAnswers.createdAt, thirtyDaysAgo)),

    // Previous 30 days (for comparison)
    db.select({ count: sql<number>`count(*)` })
      .from(colleges)
      .where(and(
        gte(colleges.createdAt, sixtyDaysAgo),
        lt(colleges.createdAt, thirtyDaysAgo)
      )),
    db.select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(and(
        gte(courses.createdAt, sixtyDaysAgo),
        lt(courses.createdAt, thirtyDaysAgo)
      )),
    db.select({ count: sql<number>`count(*)` })
      .from(counselors)
      .where(and(
        gte(counselors.createdAt, sixtyDaysAgo),
        lt(counselors.createdAt, thirtyDaysAgo)
      )),
    db.select({ count: sql<number>`count(*)` })
      .from(studentAnswers)
      .where(and(
        gte(studentAnswers.createdAt, sixtyDaysAgo),
        lt(studentAnswers.createdAt, thirtyDaysAgo)
      )),
  ])

  // Extract counts
  const totalColleges = Number(totalCollegesResult[0]?.count || 0)
  const totalCourses = Number(totalCoursesResult[0]?.count || 0)
  const totalCounselors = Number(totalCounselorsResult[0]?.count || 0)

  // Calculate total students - use sum from colleges if available, otherwise count studentAnswers
  const studentsFromColleges = Number(totalStudentsResult[0]?.total || 0)
  const studentAnswersCount = Number(
    (await db.select({ count: sql<number>`count(*)` }).from(studentAnswers))[0]?.count || 0
  )
  const totalStudents = studentsFromColleges > 0 ? studentsFromColleges : studentAnswersCount

  // Extract period counts
  const collegesCurrent = Number(collegesLast30Days[0]?.count || 0)
  const coursesCurrent = Number(coursesLast30Days[0]?.count || 0)
  const counselorsCurrent = Number(counselorsLast30Days[0]?.count || 0)
  const studentsCurrent = Number(studentsLast30Days[0]?.count || 0)

  const collegesPrevious = Number(collegesPrevious30Days[0]?.count || 0)
  const coursesPrevious = Number(coursesPrevious30Days[0]?.count || 0)
  const counselorsPrevious = Number(counselorsPrevious30Days[0]?.count || 0)
  const studentsPrevious = Number(studentsPrevious30Days[0]?.count || 0)

  // Calculate trends
  const collegesTrend = calculateTrend(collegesCurrent, collegesPrevious)
  const coursesTrend = calculateTrend(coursesCurrent, coursesPrevious)
  const counselorsTrend = calculateTrend(counselorsCurrent, counselorsPrevious)
  const studentsTrend = calculateTrend(studentsCurrent, studentsPrevious)

  // Fetch recent activity
  const [recentColleges, recentLeads, recentUsers] = await Promise.all([
    db.select()
      .from(colleges)
      .orderBy(desc(colleges.createdAt))
      .limit(3),
    db.select()
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(3),
    db.select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(3),
  ])

  // Build recent activities array with dates for sorting
  const recentActivitiesWithDates: Array<{ title: string; time: string; type: string; date: Date }> = []

  // Add recent colleges
  recentColleges.forEach((college) => {
    recentActivitiesWithDates.push({
      title: `New college added: ${college.name}`,
      time: formatTimeAgo(new Date(college.createdAt)),
      type: "college",
      date: new Date(college.createdAt),
    })
  })

  // Add recent leads
  recentLeads.slice(0, 2).forEach((lead) => {
    recentActivitiesWithDates.push({
      title: `New lead: ${lead.name}`,
      time: formatTimeAgo(new Date(lead.createdAt)),
      type: "lead",
      date: new Date(lead.createdAt),
    })
  })

  // Add recent users
  recentUsers.slice(0, 1).forEach((user) => {
    recentActivitiesWithDates.push({
      title: `New user registration: ${user.name || user.email}`,
      time: formatTimeAgo(new Date(user.createdAt)),
      type: "user",
      date: new Date(user.createdAt),
    })
  })

  // Sort by date (most recent first) and limit to 5
  const recentActivities = recentActivitiesWithDates
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5)
    .map(({ date, ...rest }) => rest) // Remove date before rendering

  const stats = [
    {
      title: "Total Colleges",
      value: formatNumber(totalColleges),
      description: "Partner colleges",
      icon: Building,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      trend: collegesTrend.value,
      trendUp: collegesTrend.isUp,
    },
    {
      title: "Total Students",
      value: formatNumber(totalStudents),
      description: "Enrolled students",
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      trend: studentsTrend.value,
      trendUp: studentsTrend.isUp,
    },
    {
      title: "Courses",
      value: formatNumber(totalCourses),
      description: "Available courses",
      icon: BookOpen,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      trend: coursesTrend.value,
      trendUp: coursesTrend.isUp,
    },
    {
      title: "Counselors",
      value: formatNumber(totalCounselors),
      description: "Active counselors",
      icon: GraduationCap,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      trend: counselorsTrend.value,
      trendUp: counselorsTrend.isUp,
    },
  ]

  // Enhanced quick actions organized by category
  const moduleCategories = [
    {
      title: "Main Operations",
      gradient: "from-blue-500 to-indigo-600",
      modules: [
        {
          title: "Analytics",
          description: "Platform insights & metrics",
          href: "/dashboard/analytics",
          icon: BarChart3,
          gradient: "from-blue-500 to-indigo-600",
        },
        {
          title: "Leads",
          description: "Contact submissions",
          href: "/dashboard/leads",
          icon: FileText,
          gradient: "from-purple-500 to-pink-600",
        },
        {
          title: "Inquiries",
          description: "Student questions",
          href: "/dashboard/inquiries",
          icon: FileText,
          gradient: "from-emerald-500 to-teal-600",
        },
      ],
    },
    {
      title: "Academic Management",
      gradient: "from-emerald-500 to-teal-600",
      modules: [
        {
          title: "Colleges",
          description: "Partner institutions",
          href: "/dashboard/colleges",
          icon: Building,
          gradient: "from-blue-500 to-cyan-600",
        },
        {
          title: "Courses",
          description: "Program catalog",
          href: "/dashboard/courses",
          icon: BookOpen,
          gradient: "from-purple-500 to-indigo-600",
        },
        {
          title: "Scholarships",
          description: "Financial aid programs",
          href: "/dashboard/scholarships",
          icon: GraduationCap,
          gradient: "from-amber-500 to-orange-600",
        },
        {
          title: "Cutoffs",
          description: "Admission criteria",
          href: "/dashboard/cutoffs",
          icon: TrendingUp,
          gradient: "from-rose-500 to-red-600",
        },
        {
          title: "Placements",
          description: "Career outcomes",
          href: "/dashboard/placements",
          icon: TrendingUp,
          gradient: "from-green-500 to-emerald-600",
        },
      ],
    },
    {
      title: "Users & Staff",
      gradient: "from-purple-500 to-pink-600",
      modules: [
        {
          title: "Students",
          description: "Enrolled learners",
          href: "/dashboard/students",
          icon: Users,
          gradient: "from-blue-500 to-indigo-600",
        },
        {
          title: "Users",
          description: "Platform accounts",
          href: "/dashboard/users",
          icon: Users,
          gradient: "from-purple-500 to-pink-600",
        },
        {
          title: "Counseling",
          description: "Guidance sessions",
          href: "/dashboard/counseling",
          icon: Activity,
          gradient: "from-rose-500 to-pink-600",
        },
      ],
    },
    {
      title: "Content & Marketing",
      gradient: "from-amber-500 to-orange-600",
      modules: [
        {
          title: "News",
          description: "Latest updates",
          href: "/dashboard/news",
          icon: BookOpen,
          gradient: "from-blue-500 to-cyan-600",
        },
        {
          title: "Blog",
          description: "Articles & insights",
          href: "/dashboard/blog",
          icon: BookOpen,
          gradient: "from-purple-500 to-indigo-600",
        },
        {
          title: "Events",
          description: "Upcoming activities",
          href: "/dashboard/events",
          icon: Activity,
          gradient: "from-emerald-500 to-teal-600",
        },
        {
          title: "Testimonials",
          description: "Success stories",
          href: "/dashboard/testimonials",
          icon: Sparkles,
          gradient: "from-amber-500 to-orange-600",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-6 lg:p-10">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-400/10 to-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto space-y-6">
        {/* Compact Single-Line Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            {/* Breadcrumb Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-xl rounded-full border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <span className="text-[8px] font-black uppercase tracking-[0.25em] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Command Center
              </span>
            </div>

            {/* Compact Title */}
            <h1 className="text-2xl font-black tracking-tight leading-none">
              <span className="bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
                Platform
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-2">
                Intelligence
              </span>
            </h1>

            {/* Inline Welcome */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/60 rounded-full">
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                Welcome, <span className="text-slate-900">{session.user?.name || session.user?.email}</span>
                <span className="mx-1.5">•</span>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Compact System Status Badge */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-2xl rounded-full border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-60" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="text-[8px] font-black uppercase tracking-wider text-slate-500">System Status</div>
                <div className="text-[10px] font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  All Systems Operational
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.title}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-all duration-700`} />

                {/* Card */}
                <div className="relative h-full bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_90px_rgba(0,0,0,0.12)] transition-all duration-700 hover:-translate-y-2 overflow-hidden">
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-40 group-hover:opacity-60 transition-opacity duration-700`} />

                  {/* Content */}
                  <div className="relative p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
                          {stat.title}
                        </div>
                        <div className="text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                          {stat.value}
                        </div>
                      </div>

                      {/* Icon */}
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-xl blur-md opacity-50`} />
                        <div className={`relative p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                      <span className="text-[10px] font-bold text-slate-600">
                        {stat.description}
                      </span>
                      {stat.trend && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${stat.trendUp
                            ? 'bg-emerald-500/10 text-emerald-700'
                            : 'bg-red-500/10 text-red-700'
                          }`}>
                          {stat.trendUp ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span className="text-[10px] font-black">{stat.trend}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Module Categories */}
        <div className="space-y-4">
          {moduleCategories.map((category) => (
            <div key={category.title} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-5 rounded-[2rem] blur-xl group-hover:opacity-10 transition-opacity duration-700`} />

              <div className="relative bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_90px_rgba(0,0,0,0.12)] transition-all duration-500 overflow-hidden">
                {/* Category Header */}
                <div className="p-5 pb-4 border-b border-slate-200/50">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-0.5 w-8 bg-gradient-to-r ${category.gradient} rounded-full`} />
                    <h2 className="text-lg font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {category.title}
                    </h2>
                  </div>
                </div>

                {/* Modules Grid */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {category.modules.map((module) => {
                    const Icon = module.icon
                    return (
                      <Link
                        key={module.title}
                        href={module.href}
                        className="group/module relative"
                      >
                        {/* Glow */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} rounded-[1.5rem] blur-lg opacity-0 group-hover/module:opacity-30 transition-all duration-500`} />

                        {/* Card */}
                        <div className="relative h-full p-5 bg-white/60 backdrop-blur-xl rounded-[1.5rem] border-2 border-white/80 hover:border-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                          {/* Gradient Overlay */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover/module:opacity-5 transition-opacity duration-500`} />

                          {/* Content */}
                          <div className="relative space-y-3">
                            {/* Icon */}
                            <div className="relative w-fit">
                              <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} rounded-lg blur-sm opacity-50`} />
                              <div className={`relative p-2.5 bg-gradient-to-br ${module.gradient} rounded-lg shadow-lg group-hover/module:scale-110 group-hover/module:rotate-6 transition-all duration-500`}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                            </div>

                            {/* Text */}
                            <div className="space-y-1">
                              <h3 className="text-sm font-black text-slate-900 group-hover/module:bg-gradient-to-r group-hover/module:from-slate-900 group-hover/module:to-slate-700 group-hover/module:bg-clip-text group-hover/module:text-transparent transition-all">
                                {module.title}
                              </h3>
                              <p className="text-[9px] font-medium text-slate-600 leading-relaxed">
                                {module.description}
                              </p>
                            </div>

                            {/* Arrow */}
                            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-700 group-hover/module:text-blue-600 transition-colors">
                              <span>Open</span>
                              <ArrowRight className="h-3 w-3 group-hover/module:translate-x-1 transition-transform duration-300" />
                            </div>
                          </div>

                          {/* Shimmer */}
                          <div className="absolute inset-0 -translate-x-full group-hover/module:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity & Feature Card Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Recent Activity */}
          <div className="xl:col-span-2 group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_90px_rgba(0,0,0,0.12)] transition-all duration-500 overflow-hidden">
              {/* Header */}
              <div className="p-5 pb-4 border-b border-slate-200/50">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Live Feed
                  </h2>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Real-time platform activity
                </p>
              </div>

              {/* Activity List */}
              <div className="p-5 space-y-3">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="group/item relative p-3 rounded-xl hover:bg-white/60 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {/* Pulse Indicator */}
                      <div className="relative mt-1 flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activity.type === 'college' ? 'from-blue-500 to-indigo-500' :
                            activity.type === 'lead' ? 'from-purple-500 to-pink-500' :
                              'from-emerald-500 to-teal-500'
                          } shadow-md`} />
                        <div className={`absolute inset-0 w-2 h-2 rounded-full bg-gradient-to-r ${activity.type === 'college' ? 'from-blue-500 to-indigo-500' :
                            activity.type === 'lead' ? 'from-purple-500 to-pink-500' :
                              'from-emerald-500 to-teal-500'
                          } animate-ping opacity-60`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-xs font-bold text-slate-900 group-hover/item:text-blue-600 transition-colors leading-snug">
                          {activity.title}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-5 pt-4 border-t border-slate-200/50">
                <Link
                  href="/dashboard/analytics"
                  className="group/link flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    View All Activity
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-white group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Feature Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" />

            <div className="relative p-6 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden h-full flex flex-col justify-between">
              {/* Pattern Overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

              {/* Content */}
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <Sparkles className="h-8 w-8 text-white/90" />
                  <div className="text-2xl font-black text-white/90">01</div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white">
                    AI-Powered
                  </h3>
                  <p className="text-xs font-medium text-white/80 leading-relaxed">
                    Advanced analytics and insights powered by machine learning
                  </p>
                </div>
              </div>

              {/* Shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
