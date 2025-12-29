import { Metadata } from "next"
import { ExamsTimeline } from "@/components/entrance-exams/ExamsTimeline"
import { Calendar, Info, Bell } from "lucide-react"

// Helper function to get current academic year (April to March cycle)
function getCurrentAcademicYear(): string {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12 (January = 1, December = 12)
  
  // Academic year in India runs from April to March
  // If month is April (4) to December (12), it's currentYear - (currentYear+1)
  // If month is January (1) to March (3), it's (currentYear-1) - currentYear
  if (currentMonth >= 4) {
    // April onwards - current academic year
    return `${currentYear}-${String(currentYear + 1).slice(-2)}`
  } else {
    // January to March - previous academic year
    return `${currentYear - 1}-${String(currentYear).slice(-2)}`
  }
}

export const metadata: Metadata = {
  title: "Admission Timeline & Entrance Exams | SeeMyCampus",
  description: "Stay updated with the latest admission timelines, entrance exam dates, and registration deadlines for MBA, Engineering, Medical, and Law courses in India.",
  keywords: ["entrance exams", "admission timeline", "CAT exam dates", "JEE Main registration", "NEET", "exam calendar"],
}

export default function EntranceExamsPage() {
  const academicYear = getCurrentAcademicYear()
  
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-[#18254a] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Admission Timeline <span className="text-blue-400">{academicYear}</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Track important dates, registration deadlines, and exam schedules for India's top entrance examinations in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span className="text-sm">Centralized Calendar</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <Bell className="h-4 w-4 text-orange-400" />
              <span className="text-sm">Deadline Alerts</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <Info className="h-4 w-4 text-green-400" />
              <span className="text-sm">Official Information</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        <ExamsTimeline />
      </div>

      {/* Additional Info Section */}
      <div className="container mx-auto px-4 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 md:p-12 rounded-2xl shadow-sm border">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Track Entrance Exams?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <p className="text-gray-600">Never miss a registration deadline for your dream college entrance test.</p>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <p className="text-gray-600">Plan your preparation schedule according to the exam dates.</p>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <p className="text-gray-600">Stay informed about eligibility criteria and official website updates.</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pro Tips for Aspirants</h2>
            <ul className="space-y-4 text-gray-600 list-disc pl-5">
              <li>Register early to get your preferred exam center city.</li>
              <li>Keep all required documents ready before the registration starts.</li>
              <li>Always verify information on the official website before final submission.</li>
              <li>Check your email and the official portal regularly for any changes in the schedule.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

