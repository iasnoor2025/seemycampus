import { Metadata } from "next"
import { CareerPathSimulator } from "@/components/ai/CareerPathSimulator"

export const metadata: Metadata = {
  title: "Career Path Simulator | SeeMyCampus",
  description: "Discover your ideal career path based on your interests, skills, and get job market predictions.",
}

export default function CareerPathSimulatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Path Simulator</h1>
          <p className="text-lg text-gray-600">
            Discover your ideal career path based on your interests and skills. Get personalized
            recommendations, skill gap analysis, job market predictions, and a career progression timeline.
          </p>
        </div>

        <CareerPathSimulator />
      </div>
    </div>
  )
}

