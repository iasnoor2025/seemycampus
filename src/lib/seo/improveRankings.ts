/**
 * SEO improvements for better Google rankings
 * This file contains utilities to improve search engine visibility
 */

export interface SEOEnhancement {
  title: string
  description: string
  keywords: string[]
  h1?: string
  h2?: string[]
  internalLinks?: Array<{ text: string; url: string }>
  structuredData?: Record<string, any>
}

/**
 * Generate enhanced SEO content for college pages
 */
export function enhanceCollegeSEO(college: {
  name: string
  location?: string | null
  city?: string | null
  description?: string | null
  ranking?: number | null
  courses?: Array<{ name: string; slug: string }> | null
}): SEOEnhancement {
  const location = college.location || college.city || ""
  const locationText = location ? ` in ${location}` : ""
  
  // Enhanced title with more keywords
  const title = `${college.name}${locationText} | Admission 2025, Courses, Fees, Placements, Rankings, Cutoffs | SeeMyCampus`
  
  // Enhanced description with more information
  let description = college.description || ""
  if (!description || description.length < 150) {
    const parts: string[] = []
    parts.push(`${college.name}${locationText} is one of the top colleges in India.`)
    
    if (college.ranking) {
      parts.push(`Ranked ${college.ranking} by NIRF.`)
    }
    
    parts.push(`Get complete information about admission process, courses offered, fee structure, placement records, cutoffs, rankings, and student reviews.`)
    
    if (college.courses && college.courses.length > 0) {
      const courseNames = college.courses.slice(0, 3).map(c => c.name).join(", ")
      parts.push(`Offers ${courseNames}${college.courses.length > 3 ? ` and ${college.courses.length - 3} more courses` : ""}.`)
    }
    
    description = parts.join(" ")
  }
  
  // Ensure optimal length
  if (description.length > 160) {
    description = description.substring(0, 157) + "..."
  } else if (description.length < 120) {
    description += ` Find detailed admission information, application process, eligibility criteria, and more for ${college.name}${locationText}.`
  }
  
  // Enhanced keywords
  const keywords: string[] = [
    college.name,
    `${college.name} admission`,
    `${college.name} admission 2025`,
    `${college.name} courses`,
    `${college.name} fees`,
    `${college.name} placement`,
    `${college.name} ranking`,
    `${college.name} cutoffs`,
    `${college.name} reviews`,
  ]
  
  if (location) {
    keywords.push(
      `${college.name} ${location}`,
      `colleges in ${location}`,
      `best colleges in ${location}`,
      `top colleges in ${location}`,
      `${location} colleges`,
    )
  }
  
  if (college.courses && college.courses.length > 0) {
    college.courses.slice(0, 5).forEach(course => {
      keywords.push(
        `${course.name} ${location || ""}`.trim(),
        `${course.name} admission`,
        `${course.name} fees`,
      )
    })
  }
  
  keywords.push(
    "college admission",
    "college admission 2025",
    "college courses",
    "college fees",
    "college placement",
    "college ranking",
    "college cutoffs",
    "college reviews",
    "India colleges",
    "best colleges in India",
    "top colleges in India",
  )
  
  // H1 tag
  const h1 = `${college.name}${locationText} - Complete Guide`
  
  // H2 tags for better structure
  const h2 = [
    `${college.name} Admission 2025`,
    `${college.name} Courses`,
    `${college.name} Fees`,
    `${college.name} Placements`,
    `${college.name} Rankings`,
    `${college.name} Cutoffs`,
    `${college.name} Reviews`,
  ]
  
  // Internal links suggestions
  const internalLinks: Array<{ text: string; url: string }> = []
  
  if (location) {
    internalLinks.push({
      text: `Colleges in ${location}`,
      url: `/colleges/location/${location.toLowerCase().replace(/\s+/g, "-")}`,
    })
  }
  
  if (college.courses && college.courses.length > 0) {
    college.courses.slice(0, 3).forEach(course => {
      internalLinks.push({
        text: `${course.name} at ${college.name}`,
        url: `/courses/${course.slug}`,
      })
    })
  }
  
  internalLinks.push(
    { text: "Compare Colleges", url: "/compare" },
    { text: "College Search", url: "/colleges" },
    { text: "Fee Calculator", url: "/fee-calculator" },
    { text: "Scholarships", url: "/scholarships" },
  )
  
  return {
    title,
    description,
    keywords: [...new Set(keywords)], // Remove duplicates
    h1,
    h2,
    internalLinks,
  }
}

/**
 * Generate internal linking suggestions for better SEO
 */
export function generateInternalLinks(context: {
  type: "college" | "course" | "scholarship" | "exam"
  name: string
  location?: string | null
  relatedItems?: Array<{ name: string; slug: string; type: string }>
}): Array<{ text: string; url: string; anchor?: string }> {
  const links: Array<{ text: string; url: string; anchor?: string }> = []
  
  // Context-specific links
  switch (context.type) {
    case "college":
      links.push(
        { text: "Browse All Colleges", url: "/colleges" },
        { text: "Compare Colleges", url: "/compare" },
        { text: "College Search", url: "/colleges" },
      )
      
      if (context.location) {
        links.push({
          text: `Colleges in ${context.location}`,
          url: `/colleges/location/${context.location.toLowerCase().replace(/\s+/g, "-")}`,
        })
      }
      break
      
    case "course":
      links.push(
        { text: "Browse All Courses", url: "/courses" },
        { text: "College Search", url: "/colleges" },
      )
      break
      
    case "scholarship":
      links.push(
        { text: "Browse All Scholarships", url: "/scholarships" },
        { text: "College Search", url: "/colleges" },
      )
      break
      
    case "exam":
      links.push(
        { text: "All Entrance Exams", url: "/entrance-exams" },
        { text: "College Search", url: "/colleges" },
      )
      break
  }
  
  // Common links
  links.push(
    { text: "Fee Calculator", url: "/fee-calculator" },
    { text: "Admission Predictor", url: "/admission-predictor" },
    { text: "Career Counseling", url: "/career-counseling" },
  )
  
  // Related items
  if (context.relatedItems && context.relatedItems.length > 0) {
    context.relatedItems.slice(0, 5).forEach(item => {
      let url = ""
      switch (item.type) {
        case "college":
          url = `/colleges/${item.slug}`
          break
        case "course":
          url = `/courses/${item.slug}`
          break
        case "scholarship":
          url = `/scholarships/${item.slug}`
          break
        case "exam":
          url = `/entrance-exams/${item.slug}`
          break
      }
      
      if (url) {
        links.push({
          text: item.name,
          url,
        })
      }
    })
  }
  
  return links
}

/**
 * Generate FAQ content for better featured snippets
 */
export function generateFAQContent(college: {
  name: string
  location?: string | null
  ranking?: number | null
  courses?: Array<{ name: string }> | null
  establishedYear?: number | null
  accreditation?: string | null
}): Array<{ question: string; answer: string }> {
  const location = college.location || ""
  const locationText = location ? ` in ${location}` : ""
  
  const faqs: Array<{ question: string; answer: string }> = []
  
  // Admission FAQ
  faqs.push({
    question: `How to get admission in ${college.name}${locationText}?`,
    answer: `To get admission in ${college.name}${locationText}, you need to check the eligibility criteria, appear for required entrance exams (if applicable), and submit the application form before the deadline. Visit the official college website or contact the admissions office for detailed admission procedures and requirements.`,
  })
  
  // Fees FAQ
  faqs.push({
    question: `What are the fees for ${college.name}${locationText}?`,
    answer: `The fees for ${college.name}${locationText} vary depending on the course and program. ${college.courses && college.courses.length > 0 ? `The college offers ${college.courses.length} courses. ` : ""}For detailed fee structure including tuition fees, hostel fees, and other charges, please visit the college website or contact the admissions office.`,
  })
  
  // Ranking FAQ
  if (college.ranking) {
    faqs.push({
      question: `What is the ranking of ${college.name}${locationText}?`,
      answer: `${college.name}${locationText} is ranked ${college.ranking} by NIRF (National Institutional Ranking Framework). Rankings may vary by different ranking agencies and criteria.`,
    })
  }
  
  // Courses FAQ
  if (college.courses && college.courses.length > 0) {
    const courseNames = college.courses.slice(0, 5).map(c => c.name).join(", ")
    faqs.push({
      question: `What courses are offered at ${college.name}${locationText}?`,
      answer: `${college.name}${locationText} offers various courses including ${courseNames}${college.courses.length > 5 ? ` and ${college.courses.length - 5} more courses` : ""}. Visit the college page to see all available courses with detailed information about admission, fees, and eligibility.`,
    })
  }
  
  // Accreditation FAQ
  if (college.accreditation) {
    faqs.push({
      question: `Is ${college.name}${locationText} accredited?`,
      answer: `Yes, ${college.name}${locationText} is accredited by ${college.accreditation}, which ensures quality education and recognition of degrees.`,
    })
  }
  
  // Established year FAQ
  if (college.establishedYear) {
    faqs.push({
      question: `When was ${college.name}${locationText} established?`,
      answer: `${college.name}${locationText} was established in ${college.establishedYear}, making it ${new Date().getFullYear() - college.establishedYear} years old.`,
    })
  }
  
  return faqs
}

