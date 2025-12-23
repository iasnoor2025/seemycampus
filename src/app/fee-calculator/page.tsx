import { Metadata } from "next"
import { FeeCalculatorClient } from "@/components/fee-calculator/FeeCalculatorClient"
import { baseUrl } from "@/lib/seo/generateMeta"

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            College Fee Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate the total cost of your college education including all fees and expenses
          </p>
        </div>
        <FeeCalculatorClient />
      </div>
    </div>
  )
}

