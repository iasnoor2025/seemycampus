import { Metadata } from "next"
import { Suspense } from "react"
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react"
import { ContactForm } from "@/components/contact/ContactForm"
import { db } from "@/db"
import { siteSettings } from "@/db/schema"
import { eq } from "drizzle-orm"

async function getContactInfo() {
  try {
    const contactSettings = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.category, "contact"))

    // Transform to key-value pairs
    const contactInfo: Record<string, string> = {}
    contactSettings.forEach((setting) => {
      contactInfo[setting.key] = setting.value || ""
    })

    // Return with defaults if not set
    return {
      email: contactInfo.contact_email || "info@seemycampus.com",
      phone: contactInfo.contact_phone || "+91-XXX-XXX-XXXX",
      address: contactInfo.contact_address || "New Delhi, India",
    }
  } catch (error) {
    console.error("Error fetching contact info:", error)
    // Return defaults if fetch fails
    return {
      email: "info@seemycampus.com",
      phone: "+91-XXX-XXX-XXXX",
      address: "New Delhi, India",
    }
  }
}

// Revalidate every hour to allow contact info updates
export const revalidate = 3600

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  title: "Contact Us | SeeMyCampus",
  description: "Get in touch with Seemycampus for college admissions counseling and guidance. We're here to help you find your perfect college match.",
  keywords: ["contact seemycampus", "college counseling", "admission help", "student guidance", "education consultation"],
  openGraph: {
    title: "Contact Us | SeeMyCampus",
    description: "Get in touch with Seemycampus for college admissions counseling and guidance. We're here to help you find your perfect college match.",
    url: `${baseUrl}/contact`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/main-logo-xxxx.png`,
        width: 1200,
        height: 630,
        alt: "Contact SeeMyCampus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | SeeMyCampus",
    description: "Get in touch with Seemycampus for college admissions counseling and guidance.",
  },
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
}

export default async function ContactPage() {
  const contactInfo = await getContactInfo()

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
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium text-sm">Get in Touch</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Have questions? We're here to help! Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Info Cards */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Email Us</h3>
              <a href={`mailto:${contactInfo.email}`} className="text-gray-600 hover:text-blue-600 transition-colors">
                {contactInfo.email}
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Call Us</h3>
              <a href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, "")}`} className="text-gray-600 hover:text-blue-600 transition-colors">
                {contactInfo.phone}
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600">{contactInfo.address}</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                Send us a Message
              </h2>
              <p className="text-gray-600">Fill out the form below and we'll get back to you soon.</p>
            </div>
            <Suspense fallback={<div className="text-center py-8 text-gray-600">Loading form...</div>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  )
}

