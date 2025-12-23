import { Metadata } from "next"

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

interface College {
  id: number
  name: string
  slug: string
  location?: string | null
  city?: string | null
  description?: string | null
  images?: string[] | null
}

interface Course {
  id: number
  name: string
  slug: string
  description?: string | null
  duration?: string | null
  fees?: number | null
  level?: string | null
}

export function generateCollegeMeta(college: College): Metadata {
  const title = `${college.name} | SeeMyCampus`
  const description =
    college.description ||
    `Learn about ${college.name} - ${college.location || college.city || "a leading educational institution"}. Find courses, admission details, and more.`
  const imageUrl = college.images && Array.isArray(college.images) && college.images.length > 0 
    ? college.images[0] 
    : (typeof college.images === 'string' ? college.images : undefined)

  return {
    title,
    description,
    keywords: [
      college.name,
      college.location || "",
      college.city || "",
      "college",
      "admissions",
      "courses",
      "education",
      "India colleges",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/colleges/${college.slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: `${college.name} - SeeMyCampus` }] : undefined,
      locale: "en_IN",
      siteName: "SeeMyCampus",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: `${baseUrl}/colleges/${college.slug}`,
    },
  }
}

export function generateCourseMeta(course: Course, college?: { name: string; slug: string } | null): Metadata {
  const title = `${course.name}${college ? ` at ${college.name}` : ""} | SeeMyCampus`
  const description =
    course.description ||
    `Learn about ${course.name}${college ? ` at ${college.name}` : ""}. ${course.duration ? `Duration: ${course.duration}.` : ""} ${course.fees ? `Fees: ₹${course.fees.toLocaleString()}.` : ""} Find admission details and more.`

  return {
    title,
    description,
    keywords: [
      course.name,
      college?.name || "",
      course.level || "",
      "course",
      "admissions",
      "education",
      "college course",
      "India courses",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/courses/${course.slug}`,
      images: [
        {
          url: `${baseUrl}/main-logo-xxxx.png`,
          width: 1200,
          height: 630,
          alt: `${course.name} - SeeMyCampus`,
        },
      ],
      locale: "en_IN",
      siteName: "SeeMyCampus",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/main-logo-xxxx.png`],
    },
    alternates: {
      canonical: `${baseUrl}/courses/${course.slug}`,
    },
  }
}

interface CollegeWithDetails extends College {
  ranking?: number | null
  establishedYear?: number | null
  accreditation?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  averagePackage?: number | null
  highestPackage?: number | null
  ownership?: string | null
  campusSize?: string | null
  totalStudents?: number | null
}

export function generateStructuredDataCollege(college: CollegeWithDetails) {
  const structuredData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: college.name,
    url: `${baseUrl}/colleges/${college.slug}`,
  }

  if (college.description) {
    structuredData.description = college.description
  }

  if (college.images && college.images.length > 0) {
    const imageUrl = Array.isArray(college.images) ? college.images[0] : college.images
    structuredData.image = imageUrl
    structuredData.logo = imageUrl
  }

  if (college.city || college.location) {
    structuredData.address = {
      "@type": "PostalAddress",
      addressLocality: college.city || college.location || "",
      addressRegion: college.location || "",
      addressCountry: "IN",
    }
  }

  if (college.website) {
    structuredData.sameAs = [college.website]
  }

  if (college.email) {
    structuredData.email = college.email
  }

  if (college.phone) {
    structuredData.telephone = college.phone
  }

  if (college.establishedYear) {
    structuredData.foundingDate = college.establishedYear.toString()
  }

  if (college.accreditation) {
    structuredData.accreditation = {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: college.accreditation,
    }
  }

  if (college.averagePackage || college.highestPackage) {
    structuredData.jobLocation = {
      "@type": "Place",
    }
    if (college.averagePackage) {
      structuredData.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: "4.5", // Placeholder - should come from reviews
        reviewCount: "0", // Should come from reviews count
      }
    }
  }

  // Filter out undefined values
  return Object.fromEntries(
    Object.entries(structuredData).filter(([_, value]) => value !== undefined)
  )
}

export function generateBreadcrumbList(items: Array<{ name: string; url: string }>) {
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  }
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export function generateReviewStructuredData(reviews: Array<{
  author: string
  rating: number
  reviewBody: string
  datePublished: string
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "CollegeOrUniversity",
    },
    review: reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: review.reviewBody,
      datePublished: review.datePublished,
    })),
  }
}

export function generateStructuredDataCourse(course: Course, college?: { name: string; slug: string } | null) {
  const structuredData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    courseCode: course.slug,
    url: `${baseUrl}/courses/${course.slug}`,
  }

  if (course.description) {
    structuredData.description = course.description
  }

  if (college) {
    structuredData.provider = {
      "@type": "EducationalOrganization",
      name: college.name,
      url: `${baseUrl}/colleges/${college.slug}`,
    }
  }

  if (course.level) {
    structuredData.educationalLevel = course.level
  }

  if (course.duration) {
    structuredData.timeRequired = course.duration
  }

  if (course.fees) {
    structuredData.offers = {
      "@type": "Offer",
      price: course.fees,
      priceCurrency: "INR",
    }
  }

  // Filter out undefined values
  return Object.fromEntries(
    Object.entries(structuredData).filter(([_, value]) => value !== undefined)
  )
}

