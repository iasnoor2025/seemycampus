"use client"

import { GraduationCap, Building2, BookOpen, Users } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: <Building2 className="w-8 h-8" />,
      number: "60,000+",
      label: "Colleges",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      number: "375,000+",
      label: "Courses",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      number: "50,000+",
      label: "Students Helped",
      gradient: "from-violet-500 to-purple-600"
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      number: "100+",
      label: "Expert Counselors",
      gradient: "from-teal-500 to-emerald-600"
    }
  ]

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rotate-12 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative"
            >
              <div className="glass-morphism p-8 rounded-3xl border-white/5 hover:border-white/20 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white mb-6 shadow-xl transform group-hover:rotate-6 transition-transform duration-500`}>
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2 tracking-tight">
                  {stat.number}
                </div>
                <div className="text-blue-200/80 text-sm md:text-base font-semibold tracking-wide uppercase">
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

