"use client"

import { GraduationCap, Building2, BookOpen, Users } from "lucide-react"

interface StatsSectionProps {
  stats?: {
    colleges: string
    courses: string
    students: string
    counselors: string
  }
}

export function StatsSection({ stats: customStats }: StatsSectionProps) {
  const stats = [
    {
      Icon: Building2,
      number: customStats?.colleges || "60,000+",
      label: "Colleges",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      Icon: BookOpen,
      number: customStats?.courses || "375,000+",
      label: "Courses",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      Icon: Users,
      number: customStats?.students || "50,000+",
      label: "Students Helped",
      gradient: "from-violet-500 to-purple-600"
    },
    {
      Icon: GraduationCap,
      number: customStats?.counselors || "100+",
      label: "Expert Counselors",
      gradient: "from-teal-500 to-emerald-600"
    }
  ]

  return (
    <section className="py-16 bg-slate-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rotate-12 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative"
            >
              <div className="glass-morphism p-5 md:p-6 rounded-2xl border-white/5 hover:border-white/20 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
                <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${stat.gradient} text-white mb-4 shadow-xl transform group-hover:rotate-6 transition-transform duration-500`}>
                  <stat.Icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-white mb-1 tracking-tight">
                  {stat.number}
                </div>
                <div className="text-blue-200/80 text-[10px] md:text-xs font-bold tracking-wider uppercase">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
