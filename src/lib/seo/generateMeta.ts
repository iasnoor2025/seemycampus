import { Metadata } from "next"

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"
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

export function generateStructuredDataCollege(college: College) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"
  const structuredData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: college.name,
    url: `${baseUrl}/colleges/${college.slug}`,
  }

  if (college.description) {
    structuredData.description = college.description
  }

  if (college.images && college.images.length > 0) {
    structuredData.image = Array.isArray(college.images) ? college.images[0] : college.images
  }

  if (college.city || college.location) {
    structuredData.address = {
      "@type": "PostalAddress",
      addressLocality: college.city || college.location || "",
      addressCountry: "IN",
    }
  }

  // Filter out undefined values
  return Object.fromEntries(
    Object.entries(structuredData).filter(([_, value]) => value !== undefined)
  )
}

export function generateStructuredDataCourse(course: Course, college?: { name: string; slug: string } | null) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"
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

