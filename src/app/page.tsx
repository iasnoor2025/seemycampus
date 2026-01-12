import { Metadata } from "next"
import dynamic from "next/dynamic"
import { HeroSection } from "@/components/home/HeroSection"
import { StatsSection } from "@/components/home/StatsSection"
import { QuickToolsSection } from "@/components/home/QuickToolsSection"
import { FAQSection } from "@/components/home/FAQSection"
import { generateFAQStructuredData } from "@/lib/seo/generateMeta"
import { db } from "@/db"
import { faqs } from "@/db/schema"
import { eq, asc, desc, and } from "drizzle-orm"

// Lazy load below-the-fold sections for better initial load performance
const FeaturedColleges = dynamic(() => import("@/components/colleges/FeaturedColleges").then(mod => ({ default: mod.FeaturedColleges })), {
  loading: () => <div className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" />,
  ssr: true,
})

const UpcomingExamsSection = dynamic(() => import("@/components/home/UpcomingExamsSection").then(mod => ({ default: mod.UpcomingExamsSection })), {
  loading: () => <div className="py-20 bg-white" />,
  ssr: true,
})

const TestimonialsSection = dynamic(() => import("@/components/home/TestimonialsSection").then(mod => ({ default: mod.TestimonialsSection })), {
  loading: () => null,
  ssr: true,
})

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

export default async function Home() {
  // Fetch FAQs directly from database - only approved and active FAQs
  let faqData: Array<{ question: string; answer: string }> = []
  try {
    const results = await db
      .select({
        question: faqs.question,
        answer: faqs.answer,
      })
      .from(faqs)
      .where(and(eq(faqs.isActive, true), eq(faqs.isApproved, true)))
      .orderBy(asc(faqs.displayOrder), desc(faqs.viewCount), desc(faqs.createdAt))
      .limit(6)

    faqData = results.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    }))
  } catch (error) {
    console.error("Error fetching FAQs:", error)
  }

  // Fallback to default FAQs if database is empty
  if (faqData.length === 0) {
    faqData = [
      {
        question: "What about courses?",
        answer: "Delhi offers a wide range of courses across various colleges. Popular B.Tech specializations include Civil, Electrical, and Computer Science and Engineering at colleges like Jamia Millia Islamia (JMI), Shri Devi Sri Jyotir Matha College, and Sri Aurobindo College. M.Tech programs in Civil, Electrical, and Computer Science and Engineering are available at JMI. For management programs, MBA and other postgraduate courses are offered by IIM Ahmedabad, Shri Ram College of Commerce (SRCC), and Jesus and Mary College. Undergraduate programs include BA, B.Com, and B.A. (Hons.) in various subjects at many colleges. Law programs are available at NALSAR University of Law. Explore 60,000+ institutions and 375,000+ courses on Seemycampus."
      },
      {
        question: "Tell me about JMI fee",
        answer: "Jamia Millia Islamia (JMI) fee structure: Undergraduate courses (BA, BSc, BCom) range from ₹13,500 - ₹15,000 per year. Postgraduate courses (MA, MSc, MCom) range from ₹16,800 - ₹18,300 per year. Integrated programs: BBA+MBA at ₹1,80,000 - ₹2,00,000 per year, and Integrated M.Sc. Physics/Chemistry/Biology at ₹1,30,000 - ₹1,50,000 per year. Ph.D. programs: ₹18,000 - ₹20,000 per year for fellowship students and ₹35,000 - ₹40,000 per year for self-financing students. Additional fees include: Admissions fee (₹1,000 - ₹2,000), Examination fee (₹500 - ₹1,000), and Library fee (₹500 - ₹1,000). These are general guidelines and may vary by course. Get detailed fee information on Seemycampus."
      },
      {
        question: "Show me best colleges",
        answer: "Congratulations on considering further education! Based on your interest in Delhi colleges, here are some top recommendations: Top Engineering Colleges: 1. Jamia Millia Islamia (JMI) - One of the premier central universities in India, offering excellent engineering programs. 2. Shri Devi Sri Jyotir Matha College - A private college with a strong focus on engineering and technology. 3. Sri Aurobindo College - Another prominent private college with a good reputation for engineering. Top Management Colleges: 1. Indian Institute of Management (IIM) Ahmedabad - One of India's top management institutes, offering world-class MBA programs. 2. Indian Institute of Technology (IIT) Delhi - A premier technical institute with a strong focus on management and entrepreneurship. Top Law Colleges: NALSAR University of Law offers excellent law programs. Explore 60,000+ institutions on Seemycampus to find your perfect college."
      },
      {
        question: "How do I secure MBA admission?",
        answer: "Gain work experience, ace entrance exams (GMAT/CAT/XAT), and get expert support from Seemycampus."
      },
      {
        question: "What criteria for MBA admission?",
        answer: "Accredited degree, entrance exam scores, work experience, GPA, essays, and interviews."
      },
      {
        question: "BBA program admission process?",
        answer: "12th-grade completion required. Submit transcripts, essays, recommendations, and attend interviews."
      }
    ]
  }

  const faqStructuredData = generateFAQStructuredData(faqData)

  // WebPage structured data with image for better Google search visibility
  const webpageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "SeeMyCampus - Find Your Perfect College",
    description: "SeeMyCampus helps Indian students find the perfect college and course. Explore 60,000+ institutions, 375,000+ courses, admission details, fees, placements, rankings, and get expert admission counseling for UG and PG programs.",
    url: baseUrl,
    image: {
      "@type": "ImageObject",
      url: `${baseUrl}/main-logo-xxxx.png`,
      width: 1200,
      height: 630,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${baseUrl}/main-logo-xxxx.png`,
      width: 1200,
      height: 630,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageStructuredData) }}
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

      {/* FAQ Section */}
      <FAQSection faqs={faqData} />
    </>
  )
}
