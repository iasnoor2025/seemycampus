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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-medium text-sm">AI-Powered Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Admission Predictor
            </h1>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
              Enter your exam details to predict your admission chances at various colleges
            </p>
          </div>

          <AdmissionPredictorClient />
        </div>
      </div>
    </div>
  )
}

