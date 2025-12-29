import { Metadata } from "next"
import { AdmissionPredictorClient } from "@/components/admission/AdmissionPredictorClient"

export const metadata: Metadata = {
  title: "Admission Predictor | SeeMyCampus",
  description: "Predict your admission chances based on exam scores, ranks, and historical cutoff data. Get personalized probability estimates for colleges.",
  openGraph: {
    title: "Admission Predictor | SeeMyCampus",
    description: "Predict your admission chances based on exam scores, ranks, and historical cutoff data.",
  },
}

export default function AdmissionPredictorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admission Predictor
          </h1>
          <p className="text-lg text-gray-600">
            Enter your exam details to predict your admission chances at various colleges
          </p>
        </div>

        <AdmissionPredictorClient />
      </div>
    </div>
  )
}

