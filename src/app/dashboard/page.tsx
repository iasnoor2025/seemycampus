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

  const quickActions = [
    {
      title: "Manage Colleges",
      description: "Add or edit college information",
      href: "/dashboard/colleges",
      icon: Building,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "View Leads",
      description: "Check contact form submissions",
      href: "/dashboard/leads",
      icon: FileText,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      title: "Analytics",
      description: "View site statistics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      gradient: "from-emerald-500 to-teal-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-slate-600 text-lg">
              Welcome back, <span className="font-semibold text-slate-900">{session.user?.name || session.user?.email}</span>
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm">
            <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-700">System Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card 
              key={stat.title}
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
            >
              {/* Gradient Background Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Animated Gradient Border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg`} />
              
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      stat.trendUp ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {stat.trendUp ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>{stat.trend}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {stat.description}
                </p>
              </CardContent>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions - Takes 2 columns */}
        <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-slate-600 mt-1">
                  Common administrative tasks
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group relative p-6 rounded-xl border-2 border-slate-200 hover:border-transparent bg-gradient-to-br from-white to-slate-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <div className="relative">
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.gradient} shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-700 group-hover:bg-clip-text transition-all duration-300">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3">
                        {action.description}
                      </p>
                      <div className="flex items-center text-sm font-semibold text-slate-700 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text">
                        <span>Explore</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Takes 1 column */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-slate-600">
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="group flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                >
                  <div className="relative mt-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-ping opacity-75" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View All Link */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <Link 
                href="/dashboard/analytics"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>View All Activity</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Sparkles className="h-8 w-8 text-white/80" />
              <div className="text-2xl font-bold">AI-Powered</div>
            </div>
            <p className="text-blue-100 text-sm">
              Advanced analytics and insights powered by AI
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-white/80" />
              <div className="text-2xl font-bold">Real-Time</div>
            </div>
            <p className="text-purple-100 text-sm">
              Live data updates and monitoring
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-white/80" />
              <div className="text-2xl font-bold">Optimized</div>
            </div>
            <p className="text-emerald-100 text-sm">
              Performance optimized for speed and efficiency
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

