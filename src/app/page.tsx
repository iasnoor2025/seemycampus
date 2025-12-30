import { Metadata } from "next"
import { FeaturedColleges } from "@/components/colleges/FeaturedColleges"
import { HeroSection } from "@/components/home/HeroSection"
import { TestimonialsSection } from "@/components/home/TestimonialsSection"
import { StatsSection } from "@/components/home/StatsSection"
import { QuickToolsSection } from "@/components/home/QuickToolsSection"
import { UpcomingExamsSection } from "@/components/home/UpcomingExamsSection"
import { generateFAQStructuredData } from "@/lib/seo/generateMeta"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  title: "SeeMyCampus - Find Your Perfect College | College Search, Admission, Courses, Fees | India",
  description: "SeeMyCampus helps Indian students find the perfect college and course. Explore 60,000+ institutions, 375,000+ courses, admission details, fees, placements, rankings, and get expert admission counseling for UG and PG programs. Search colleges by location, course, ranking, and more.",
  keywords: [
    "college admissions",
    "college search India",
    "college finder",
    "course finder",
    "education counseling",
    "college recommendations",
    "college admission guidance",
    "college fees",
    "college placement",
    "college ranking",
    "college cutoffs",
    "MBA colleges",
    "BBA colleges",
    "Engineering colleges",
    "Medical colleges",
    "Law colleges",
    "Design colleges",
    "best colleges in India",
    "top colleges",
    "college comparison",
    "admission guidance",
    "college counseling",
    "university search",
    "institute search",
  ],
  openGraph: {
    title: "SeeMyCampus - Find Your Perfect College | College Search, Admission, Courses, Fees | India",
    description: "SeeMyCampus helps Indian students find the perfect college and course. Explore 60,000+ institutions, 375,000+ courses, admission details, fees, placements, rankings, and get expert admission counseling for UG and PG programs.",
    url: baseUrl,
    siteName: "SeeMyCampus",
    images: [
      {
        url: `${baseUrl}/main-logo-xxxx.png`,
        width: 1200,
        height: 630,
        alt: "SeeMyCampus - Find Your Perfect College | College Search, Admission, Courses, Fees",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SeeMyCampus - Find Your Perfect College | College Search, Admission, Courses, Fees | India",
    description: "SeeMyCampus helps Indian students find the perfect college and course. Explore 60,000+ institutions, 375,000+ courses, admission details, fees, placements, rankings, and get expert admission counseling.",
    images: [`${baseUrl}/main-logo-xxxx.png`],
  },
  alternates: {
    canonical: baseUrl,
  },
}

export default function Home() {
  // FAQ structured data for SEO
  const faqData = [
    {
      question: "How do I secure MBA admission?",
      answer: "Gain work experience, ace entrance exams (GMAT/CAT/XAT), and get expert support from Seemycampus."
    },
    {
      question: "What criteria for MBA admission?",
      answer: "Accredited degree, entrance exam scores, work experience, GPA, essays, and interviews."
    },
    {
      question: "Steps for MBA admission?",
      answer: "Research schools, build strong profile, prepare for exams, seek guidance from Seemycampus."
    },
    {
      question: "BBA program admission process?",
      answer: "12th-grade completion required. Submit transcripts, essays, recommendations, and attend interviews."
    },
    {
      question: "How to secure BBA admission?",
      answer: "Requires 12th marks (50-60%), application, documents. Seemycampus covers 60,000+ institutions."
    },
    {
      question: "Top BBA colleges for 93%?",
      answer: "Christ University, Loyola, St. Xavier's, NMIMS, Symbiosis. Get personalized guidance."
    }
  ]

  const faqStructuredData = generateFAQStructuredData(faqData)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      {/* Hero Section with Search */}
      <HeroSection />

      {/* Statistics Section */}
      <StatsSection />

      {/* Quick Tools Section */}
      <QuickToolsSection />

      {/* Top Featured Colleges */}
      <FeaturedColleges />

      {/* Upcoming Exams Section */}
      <UpcomingExamsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section - Modern Design */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-sm">Got Questions?</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4 leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
              About College Admissions and Courses
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* FAQ Items */}
            {[
              {
                num: 1,
                question: "How do I secure MBA admission?",
                answer: "Gain work experience, ace entrance exams (GMAT/CAT/XAT), and get expert support from Seemycampus.",
                gradient: "from-blue-500 to-cyan-600"
              },
              {
                num: 2,
                question: "What criteria for MBA admission?",
                answer: "Accredited degree, entrance exam scores, work experience, GPA, essays, and interviews.",
                gradient: "from-indigo-500 to-purple-600"
              },
              {
                num: 3,
                question: "Steps for MBA admission?",
                answer: "Research schools, build strong profile, prepare for exams, seek guidance from Seemycampus.",
                gradient: "from-violet-500 to-purple-600"
              },
              {
                num: 4,
                question: "BBA program admission process?",
                answer: "12th-grade completion required. Submit transcripts, essays, recommendations, and attend interviews.",
                gradient: "from-teal-500 to-emerald-600"
              },
              {
                num: 5,
                question: "How to secure BBA admission?",
                answer: "Requires 12th marks (50-60%), application, documents. Seemycampus covers 60,000+ institutions.",
                gradient: "from-sky-500 to-blue-600"
              },
              {
                num: 6,
                question: "Top BBA colleges for 93%?",
                answer: "Christ University, Loyola, St. Xavier's, NMIMS, Symbiosis. Get personalized guidance.",
                gradient: "from-purple-500 to-pink-600"
              }
            ].map((faq, index) => (
              <div
                key={faq.num}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 group"
              >
                {/* Number Badge */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${faq.gradient} text-white font-bold text-lg mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {faq.num}
                </div>
                
                {/* Question */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {faq.question}
                </h3>
                
                {/* Answer */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
