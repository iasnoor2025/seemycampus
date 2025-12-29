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
    <section className="py-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-white/90 text-sm md:text-base font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

