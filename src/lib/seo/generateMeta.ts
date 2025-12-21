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
  const title = `${college.name} | SeeMyCampus`
  const description =
    college.description ||
    `Learn about ${college.name} - ${college.location || college.city || "a leading educational institution"}. Find courses, admission details, and more.`
  const imageUrl = college.images && college.images.length > 0 ? college.images[0] : undefined

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
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://seemycampus.com/colleges/${college.slug}`,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: `https://seemycampus.com/colleges/${college.slug}`,
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
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://seemycampus.com/courses/${course.slug}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `https://seemycampus.com/courses/${course.slug}`,
    },
  }
}

export function generateStructuredDataCollege(college: College) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: college.name,
    description: college.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: college.city || college.location,
      addressCountry: "IN",
    },
    url: `https://seemycampus.com/colleges/${college.slug}`,
    image: college.images && college.images.length > 0 ? college.images[0] : undefined,
  }
}

export function generateStructuredDataCourse(course: Course, college?: { name: string; slug: string } | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: course.description,
    provider: college
      ? {
          "@type": "EducationalOrganization",
          name: college.name,
          url: `https://seemycampus.com/colleges/${college.slug}`,
        }
      : undefined,
    courseCode: course.slug,
    educationalLevel: course.level,
    timeRequired: course.duration,
    offers: course.fees
      ? {
          "@type": "Offer",
          price: course.fees,
          priceCurrency: "INR",
        }
      : undefined,
  }
}

