"use client"

import Link from "next/link"
import { Calculator, TrendingUp, FileText, GitCompare, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const tools = [
  {
    name: "Admission Predictor",
    description: "Check your admission chances",
    icon: <TrendingUp className="w-6 h-6" />,
    link: "/admission-predictor",
    gradient: "from-blue-500 to-cyan-600",
    color: "text-blue-600"
  },
  {
    name: "Fee Calculator",
    description: "Calculate total college costs",
    icon: <Calculator className="w-6 h-6" />,
    link: "/fee-calculator",
    gradient: "from-indigo-500 to-purple-600",
    color: "text-indigo-600"
  },
  {
    name: "Compare Colleges",
    description: "Side-by-side comparison",
    icon: <GitCompare className="w-6 h-6" />,
    link: "/compare",
    gradient: "from-violet-500 to-purple-600",
    color: "text-violet-600"
  },
  {
    name: "Career Path",
    description: "Explore career options",
    icon: <Target className="w-6 h-6" />,
    link: "/career-path",
    gradient: "from-teal-500 to-emerald-600",
    color: "text-teal-600"
  },
  {
    name: "Essay Assistant",
    description: "AI-powered essay help",
    icon: <FileText className="w-6 h-6" />,
    link: "/essay-assistant",
    gradient: "from-sky-500 to-blue-600",
    color: "text-sky-600"
  }
]

export function QuickToolsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="font-medium text-sm">Powerful Tools</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4 leading-tight">
            Everything You Need
          </h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
            Smart tools to help you make the right decisions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {tools.map((tool, index) => (
            <Link key={index} href={tool.link}>
              <Card className="h-full hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] transition-all duration-500 transform hover:-translate-y-3 border-slate-200/60 bg-white/80 backdrop-blur-sm group overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${tool.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                <CardContent className="p-8">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {tool.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-3 group-hover:${tool.color} transition-colors duration-300`}>
                    {tool.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {tool.description}
                  </p>

                  <div className="mt-6 flex items-center text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Try now <span className="ml-2">→</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

