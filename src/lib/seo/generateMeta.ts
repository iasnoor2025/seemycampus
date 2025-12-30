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
  courses?: Array<{ name: string }> | null
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

interface CollegeForMeta extends College {
  ranking?: number | null
  establishedYear?: number | null
  accreditation?: string | null
  averagePackage?: number | null
  courses?: Array<{ name: string }> | null
}

export function generateCollegeMeta(college: CollegeForMeta): Metadata {
  const collegeName = college.name
  const location = college.location || college.city || ""
  const locationText = location ? ` in ${location}` : ""
  
  // Build keyword-rich description
  let description = college.description || ""
  
  // If no description or short description, create a comprehensive one
  if (!description || description.length < 100) {
    const parts: string[] = []
    parts.push(`${collegeName}${locationText}`)
    
    if (college.ranking) {
      parts.push(`Ranked ${college.ranking}`)
    }
    
    if (college.establishedYear) {
      parts.push(`Established in ${college.establishedYear}`)
    }
    
    if (college.accreditation) {
      parts.push(`${college.accreditation} accredited`)
    }
    
    parts.push("Get complete information about admission process, courses, fees, placements, cutoffs, and reviews")
    
    if (college.courses && college.courses.length > 0) {
      const courseNames = college.courses.slice(0, 3).map(c => c.name).join(", ")
      parts.push(`Offers ${courseNames}${college.courses.length > 3 ? ` and ${college.courses.length - 3} more courses` : ""}`)
    }
    
    description = parts.join(". ") + "."
  } else {
    // Enhance existing description with keywords
    if (!description.toLowerCase().includes("admission")) {
      description += " Get admission details, application process, and eligibility criteria."
    }
    if (!description.toLowerCase().includes("course")) {
      description += " Explore courses, fees, and program details."
    }
  }
  
  // Ensure description is between 120-160 characters for optimal SEO
  if (description.length > 160) {
    description = description.substring(0, 157) + "..."
  } else if (description.length < 120) {
    description += ` Find complete information about ${collegeName}${locationText} including admission, courses, fees, placements, and reviews.`
  }
  
  const title = `${collegeName}${locationText ? ` - ${location}` : ""} | Admission, Courses, Fees, Placements | SeeMyCampus`
  const imageUrl = college.images && Array.isArray(college.images) && college.images.length > 0 
    ? college.images[0] 
    : (typeof college.images === 'string' ? college.images : undefined)

  // Build comprehensive keywords array
  const keywords: string[] = [
    collegeName,
    `${collegeName} admission`,
    `${collegeName} courses`,
    `${collegeName} fees`,
    `${collegeName} placement`,
    `${collegeName} ranking`,
    `${collegeName} cutoffs`,
  ]
  
  if (location) {
    keywords.push(
      `${collegeName} ${location}`,
      `colleges in ${location}`,
      `best colleges in ${location}`,
      location
    )
  }
  
  if (college.city && college.city !== location) {
    keywords.push(`${collegeName} ${college.city}`, `colleges in ${college.city}`)
  }
  
  keywords.push(
    "college admission",
    "college courses",
    "college fees",
    "college placement",
    "college ranking",
    "education",
    "India colleges",
    "university",
    "institute"
  )
  
  if (college.accreditation) {
    keywords.push(`${college.accreditation} colleges`)
  }
  
  if (college.courses && college.courses.length > 0) {
    college.courses.slice(0, 5).forEach(course => {
      keywords.push(`${course.name} ${location || ""}`.trim())
    })
  }

  return {
    title,
    description,
    keywords: keywords.filter(Boolean).filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/colleges/${college.slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: `${collegeName} - SeeMyCampus` }] : undefined,
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
  courses?: Array<{ name: string; slug: string; level?: string | null; description?: string | null }> | null
  entranceExams?: string[] | null
  reviewCount?: number | null // Number of approved reviews
  averageRating?: number | null // Average rating from reviews (1-5)
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

  // Add courses/programs offered
  if (college.courses && college.courses.length > 0) {
    structuredData.hasProgram = college.courses.map((course) => {
      const courseData: Record<string, any> = {
        "@type": "Course",
        name: course.name,
        url: `${baseUrl}/courses/${course.slug}`,
      }
      
      // Add description (required for rich results)
      if (course.description) {
        courseData.description = course.description
      } else {
        // Generate a basic description if missing
        courseData.description = `${course.name} program at ${college.name}${college.location ? ` in ${college.location}` : ""}. ${course.level ? `This is a ${course.level} level program.` : ""}`
      }
      
      // Add provider (college) - recommended for rich results
      courseData.provider = {
        "@type": "EducationalOrganization",
        name: college.name,
        url: `${baseUrl}/colleges/${college.slug}`,
      }
      
      // Add educational level if available
      if (course.level) {
        courseData.educationalLevel = course.level
      }
      
      return courseData
    })
  }

  // Add aggregate rating only if reviews exist (reviewCount must be > 0)
  // Note: This should be populated with actual review data when available
  // For now, we only include it if explicitly provided with valid review count
  if (college.reviewCount && college.reviewCount > 0 && college.averageRating) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: college.averageRating.toString(),
      reviewCount: college.reviewCount.toString(),
    }
  }

  // Add additional properties
  if (college.ranking) {
    structuredData.award = `Ranked ${college.ranking}`
  }

  if (college.totalStudents) {
    structuredData.numberOfStudents = college.totalStudents
  }

  if (college.ownership) {
    structuredData.ownership = college.ownership
  }

  // Filter out undefined values
  return Object.fromEntries(
    Object.entries(structuredData).filter(([_, value]) => value !== undefined)
  )
}

// Generate FAQ structured data for colleges
export function generateCollegeFAQStructuredData(college: CollegeWithDetails) {
  const faqs: Array<{ question: string; answer: string }> = []
  
  // Admission FAQ
  faqs.push({
    question: `What is the admission process for ${college.name}?`,
    answer: `The admission process for ${college.name}${college.location ? ` in ${college.location}` : ""} typically involves${college.entranceExams && college.entranceExams.length > 0 ? ` entrance exams like ${college.entranceExams.slice(0, 3).join(", ")}` : " application submission"}. Visit the official website or contact the college directly for detailed admission requirements and deadlines.`
  })
  
  // Fees FAQ
  faqs.push({
    question: `What are the fees for ${college.name}?`,
    answer: `The fees for ${college.name}${college.location ? ` in ${college.location}` : ""} vary by course and program. ${college.courses && college.courses.length > 0 ? `The college offers ${college.courses.length} courses. ` : ""}For detailed fee structure, please visit the college website or contact the admissions office directly.`
  })
  
  // Courses FAQ
  if (college.courses && college.courses.length > 0) {
    const courseNames = college.courses.slice(0, 5).map(c => c.name).join(", ")
    faqs.push({
      question: `What courses are offered at ${college.name}?`,
      answer: `${college.name}${college.location ? ` in ${college.location}` : ""} offers various courses including ${courseNames}${college.courses.length > 5 ? ` and ${college.courses.length - 5} more courses` : ""}. Visit the college page to see all available courses and their details.`
    })
  }
  
  // Ranking FAQ
  if (college.ranking) {
    faqs.push({
      question: `What is the ranking of ${college.name}?`,
      answer: `${college.name}${college.location ? ` in ${college.location}` : ""} is ranked ${college.ranking}. Rankings may vary by different ranking agencies and criteria.`
    })
  }
  
  // Placement FAQ
  if (college.averagePackage || college.highestPackage) {
    const placementInfo: string[] = []
    if (college.averagePackage) {
      placementInfo.push(`average package of ₹${college.averagePackage.toLocaleString()}`)
    }
    if (college.highestPackage) {
      placementInfo.push(`highest package of ₹${college.highestPackage.toLocaleString()}`)
    }
    faqs.push({
      question: `What are the placement opportunities at ${college.name}?`,
      answer: `${college.name}${college.location ? ` in ${college.location}` : ""} offers good placement opportunities with ${placementInfo.join(" and ")}. The college has a dedicated placement cell that assists students in securing job opportunities.`
    })
  }
  
  // Accreditation FAQ
  if (college.accreditation) {
    faqs.push({
      question: `Is ${college.name} accredited?`,
      answer: `Yes, ${college.name}${college.location ? ` in ${college.location}` : ""} is accredited by ${college.accreditation}, which ensures quality education and recognition of degrees.`
    })
  }
  
  // Established year FAQ
  if (college.establishedYear) {
    faqs.push({
      question: `When was ${college.name} established?`,
      answer: `${college.name}${college.location ? ` in ${college.location}` : ""} was established in ${college.establishedYear}, making it ${new Date().getFullYear() - college.establishedYear} years old.`
    })
  }
  
  if (faqs.length === 0) {
    return null
  }
  
  return generateFAQStructuredData(faqs)
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

