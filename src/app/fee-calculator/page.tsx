import { Metadata } from "next"
import { FeeCalculatorClient } from "@/components/fee-calculator/FeeCalculatorClient"
import { baseUrl } from "@/lib/seo/generateMeta"
import { Calculator } from "lucide-react"

export const metadata: Metadata = {
  title: "College Fee Calculator | Calculate Total Education Cost",
  description:
    "Calculate the total cost of your college education including tuition fees, hostel fees, and other expenses. Plan your education budget with our fee calculator.",
  keywords: [
    "fee calculator",
    "college fees",
    "tuition calculator",
    "education cost",
    "hostel fees",
    "total cost calculator",
  ],
  openGraph: {
    title: "College Fee Calculator | SeeMyCampus",
    description:
      "Calculate the total cost of your college education including tuition fees, hostel fees, and other expenses.",
    url: `${baseUrl}/fee-calculator`,
  },
  alternates: {
    canonical: `${baseUrl}/fee-calculator`,
  },
}

export default async function FeeCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 shadow-lg">
              <Calculator className="w-5 h-5" />
              <span className="font-medium text-sm">Financial Planning</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              College Fee Calculator
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Calculate the total cost of your college education including all fees and expenses
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <FeeCalculatorClient />
        </div>
      </section>
    </div>
  )
}

