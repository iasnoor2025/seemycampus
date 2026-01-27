import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react"
import { CollegesList } from "@/components/dashboard/CollegesList"
import { getAllColleges } from "@/lib/colleges"
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader"

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

  const stats = [
    {
      title: "Total Institutions",
      value: totalColleges,
      label: "Live on Platform",
      icon: Building2,
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Verified Partners",
      value: academicAllianceColleges,
      label: "Academic Alliance",
      icon: ShieldCheck,
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      title: "Active Status",
      value: totalColleges,
      label: "Publicly Visible",
      icon: CheckCircle2,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Data Coverage",
      value: "98%",
      label: "System Health",
      icon: Sparkles,
      gradient: "from-amber-500 to-orange-600"
    }
  ]

  return (
    <div className="p-8 lg:p-12 space-y-12">
      <DashboardPageHeader
        title="Colleges"
        description="Global directory management for all partner institutions and academic alliances."
        breadcrumbs={[{ label: "Colleges" }]}
        icon={Building2}
      />

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="group relative overflow-hidden border-0 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-700 hover:-translate-y-2 bg-white rounded-[2rem]"
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.title}</h4>
                  <div className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">
                    {stat.value}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Table Interface */}
      <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-10 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Institution Registry</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Manage, Edit, and Audit College Metadata</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-10 py-8 bg-slate-50/50">
            <CollegesList />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
