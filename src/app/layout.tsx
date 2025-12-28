import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ConditionalLayout } from "@/components/layout/ConditionalLayout"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SeeMyCampus - Find Your Perfect College | Admissions Counseling Platform",
    template: "%s | SeeMyCampus",
  },
  description: "Seemycampus is student's go-to platform providing holistic approach on all aspects of education, simplifying the college selection process for Indian students pursuing undergraduate (UG) and postgraduate (PG) courses.",
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
    description: "Seemycampus is student's go-to platform providing holistic approach on all aspects of education, simplifying the college selection process for Indian students pursuing undergraduate (UG) and postgraduate (PG) courses.",
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
    description: "Seemycampus is student's go-to platform providing holistic approach on all aspects of education, simplifying the college selection process for Indian students pursuing undergraduate (UG) and postgraduate (PG) courses.",
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
    logo: `${baseUrl}/main-logo-xxxx.png`,
    description: "Seemycampus is student's go-to platform providing holistic approach on all aspects of education, simplifying the college selection process for Indian students pursuing undergraduate (UG) and postgraduate (PG) courses.",
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
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/colleges?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <SessionProvider>
        <ConditionalLayout>{children}</ConditionalLayout>
        <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
