import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ConditionalLayout } from "@/components/layout/ConditionalLayout"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { Toaster } from "@/components/ui/toaster"
import dynamic from "next/dynamic"

// Dynamically import heavy components to reduce initial bundle size
const ContactFormPopup = dynamic(
  () => import("@/components/contact/ContactFormPopup").then(mod => ({ default: mod.ContactFormPopup })),
  { 
    ssr: false,
    loading: () => null, // Don't show loading state for popup
  }
)

const ChatbotWidget = dynamic(
  () => import("@/components/chat/ChatbotWidget").then(mod => ({ default: mod.ChatbotWidget })),
  { 
    ssr: false,
    loading: () => null, // Don't show loading state for widget
  }
)

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SeeMyCampus - Find Your Perfect College",
    template: "%s | SeeMyCampus",
  },
  description: "SeeMyCampus helps Indian students find the perfect college and course. Explore 60,000+ institutions, 375,000+ courses, and get expert admission counseling for UG and PG programs.",
  keywords: ["college admissions", "course finder", "education counseling", "college recommendations", "MBA", "BBA", "Engineering", "Medical", "Law", "Design", "college search", "admission guidance", "career counseling", "India colleges"],
  authors: [{ name: "SeeMyCampus" }],
  creator: "SeeMyCampus",
  publisher: "SeeMyCampus",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    siteName: "SeeMyCampus",
    title: "SeeMyCampus - Find Your Perfect College",
    description: "SeeMyCampus helps Indian students find the perfect college and course. Explore 60,000+ institutions, 375,000+ courses, and get expert admission counseling for UG and PG programs.",
    images: [
      {
        url: `${baseUrl}/main-logo-xxxx.png`,
        width: 1200,
        height: 630,
        alt: "SeeMyCampus Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SeeMyCampus - Find Your Perfect College",
    description: "SeeMyCampus helps Indian students find the perfect college and course. Explore 60,000+ institutions, 375,000+ courses, and get expert admission counseling for UG and PG programs.",
    images: [`${baseUrl}/main-logo-xxxx.png`],
    creator: "@seemycampus",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  verification: {
    // Add verification codes when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "SeeMyCampus",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/main-logo-xxxx.png`,
      width: 1200,
      height: 630,
    },
    image: {
      "@type": "ImageObject",
      url: `${baseUrl}/main-logo-xxxx.png`,
      width: 1200,
      height: 630,
    },
    description: "SeeMyCampus helps Indian students find the perfect college and course. Explore 60,000+ institutions, 375,000+ courses, and get expert admission counseling for UG and PG programs.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    sameAs: [
      // Add social media links when available
      // "https://www.facebook.com/seemycampus",
      // "https://www.twitter.com/seemycampus",
      // "https://www.linkedin.com/company/seemycampus",
    ],
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SeeMyCampus",
    url: baseUrl,
    image: {
      "@type": "ImageObject",
      url: `${baseUrl}/main-logo-xxxx.png`,
      width: 1200,
      height: 630,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/colleges?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    // Add mainEntity to help with sitelinks
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "College Search",
          url: `${baseUrl}/colleges`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Admission Predictor",
          url: `${baseUrl}/admission-predictor`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Compare Colleges",
          url: `${baseUrl}/compare`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Career Counseling",
          url: `${baseUrl}/career-counseling`,
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "Scholarships",
          url: `${baseUrl}/scholarships`,
        },
        {
          "@type": "ListItem",
          position: 6,
          name: "Blog",
          url: `${baseUrl}/blog`,
        },
        {
          "@type": "ListItem",
          position: 7,
          name: "Fee Calculator",
          url: `${baseUrl}/fee-calculator`,
        },
        {
          "@type": "ListItem",
          position: 8,
          name: "Entrance Exams",
          url: `${baseUrl}/entrance-exams`,
        },
      ],
    },
  }

  // SiteNavigationElement for sitelinks
  const siteNavigationSchema = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: "Main Navigation",
    url: baseUrl,
    hasPart: [
      {
        "@type": "SiteNavigationElement",
        name: "College Search",
        url: `${baseUrl}/colleges`,
        description: "Search and explore 60,000+ colleges and universities in India",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Admission Predictor",
        url: `${baseUrl}/admission-predictor`,
        description: "Predict your admission chances based on exam scores and rankings",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Compare Colleges",
        url: `${baseUrl}/compare`,
        description: "Compare multiple colleges side by side on fees, placements, and rankings",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Career Counseling",
        url: `${baseUrl}/career-counseling`,
        description: "Get expert career counseling and guidance for college admissions",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Scholarships",
        url: `${baseUrl}/scholarships`,
        description: "Find and apply for scholarships to fund your education",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Blog",
        url: `${baseUrl}/blog`,
        description: "Read articles about college admissions, courses, and career guidance",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Fee Calculator",
        url: `${baseUrl}/fee-calculator`,
        description: "Calculate total college fees including tuition, hostel, and other expenses",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Entrance Exams",
        url: `${baseUrl}/entrance-exams`,
        description: "Get information about entrance exam dates, syllabus, and preparation tips",
      },
    ],
  }

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href={`${baseUrl}/main-logo-xxxx.png`} as="image" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="alternate icon" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="image_src" href={`${baseUrl}/main-logo-xxxx.png`} />
        <meta name="image" content={`${baseUrl}/main-logo-xxxx.png`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
        />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <SessionProvider>
        <ConditionalLayout>{children}</ConditionalLayout>
        <Toaster />
        <ContactFormPopup />
        <ChatbotWidget />
        </SessionProvider>
      </body>
    </html>
  )
}
