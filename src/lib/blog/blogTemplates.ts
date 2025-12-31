/**
 * Blog Post Templates
 * Templates for different types of blog content as per SEO strategy
 */

export interface BlogTemplate {
  title: string
  structure: string[]
  seoTips: string[]
  internalLinks: string[]
}

export const blogTemplates: Record<string, BlogTemplate> = {
  admissionGuide: {
    title: "Admission Guide Template",
    structure: [
      "Introduction - Brief overview of the college and why this guide is valuable",
      "About [College Name] - History, reputation, rankings, accreditation",
      "Admission Process - Step-by-step guide",
      "Eligibility Criteria - Detailed requirements",
      "Entrance Exam - Exam details, syllabus, preparation tips",
      "Application Process - How to apply, documents needed",
      "Selection Process - How selection works",
      "Important Dates - Application deadline, exam date, result date, counseling dates",
      "Cutoff Trends - Previous year cutoffs, expected cutoffs, category-wise cutoffs",
      "Tips for Admission - Preparation tips, application tips, interview tips",
      "FAQs - Common questions and answers",
      "Conclusion - Summary and next steps",
    ],
    seoTips: [
      "Include primary keyword '[College Name] Admission Guide' in title and first paragraph",
      "Use H2 tags for main sections, H3 for subsections",
      "Include internal links to college page, course pages, and exam pages",
      "Add FAQ section with proper schema markup",
      "Include cutoff data in tables for better readability",
      "Add comparison with similar colleges",
      "Include location-based keywords if applicable",
    ],
    internalLinks: [
      "/colleges/[college-slug]",
      "/courses/[course-slug]",
      "/entrance-exams/[exam-slug]",
      "/colleges/location/[city]",
      "/scholarships",
    ],
  },
  
  locationGuide: {
    title: "Location-Based Guide Template",
    structure: [
      "Introduction - Overview of colleges in the city",
      "Top Colleges in [City] - List with rankings",
      "Admission Trends - Recent admission patterns",
      "Fee Structures - Average fees, fee ranges",
      "Placement Statistics - Placement data, top recruiters",
      "Local Advantages - Why study in this city",
      "How to Choose - Factors to consider",
      "Application Process - City-specific admission process",
      "FAQs - Location-specific questions",
      "Conclusion - Summary and recommendations",
    ],
    seoTips: [
      "Target keyword 'Best Colleges in [City]'",
      "Include city name in title, first paragraph, and throughout",
      "Link to location pages and individual college pages",
      "Add local business schema if applicable",
      "Include statistics and data tables",
      "Add comparison tables for colleges",
    ],
    internalLinks: [
      "/colleges/location/[city]",
      "/colleges/[college-slug]",
      "/courses",
      "/scholarships",
    ],
  },
  
  courseGuide: {
    title: "Course-Specific Guide Template",
    structure: [
      "Introduction - Overview of the course",
      "Top Colleges for [Course] - Ranked list",
      "Career Opportunities - Job prospects, roles",
      "Salary Expectations - Average salaries, growth",
      "Required Skills - Skills needed for the course",
      "Industry Trends - Current market trends",
      "Admission Requirements - Eligibility, entrance exams",
      "Course Curriculum - What you'll learn",
      "FAQs - Course-specific questions",
      "Conclusion - Summary and recommendations",
    ],
    seoTips: [
      "Target keyword 'Best [Course] Colleges'",
      "Include course name in title and throughout",
      "Link to course pages and college pages",
      "Add course schema markup",
      "Include salary data and career statistics",
      "Add comparison tables",
    ],
    internalLinks: [
      "/courses/[course-slug]",
      "/colleges/[college-slug]",
      "/colleges/[category]",
      "/entrance-exams",
    ],
  },
  
  comparison: {
    title: "Comparison Article Template",
    structure: [
      "Introduction - Brief overview of both colleges",
      "Quick Comparison Table - Side-by-side comparison",
      "Detailed Comparison - Rankings, fees, placements, infrastructure, faculty, location, admission",
      "Pros and Cons - For each college",
      "Which to Choose? - Recommendation based on different criteria",
      "FAQs - Comparison-related questions",
      "Conclusion - Final recommendation",
    ],
    seoTips: [
      "Target keyword '[College A] vs [College B]'",
      "Include both college names in title and throughout",
      "Use comparison tables for better readability",
      "Link to both college pages",
      "Add pros and cons sections",
      "Include decision-making framework",
    ],
    internalLinks: [
      "/colleges/[college-a-slug]",
      "/colleges/[college-b-slug]",
      "/compare",
      "/courses",
    ],
  },
  
  howTo: {
    title: "How-To Guide Template",
    structure: [
      "Introduction - What you'll learn",
      "Prerequisites - What you need to know/do first",
      "Step-by-Step Instructions - Clear numbered steps",
      "Tips and Best Practices - Additional advice",
      "Common Mistakes to Avoid - What not to do",
      "Troubleshooting - Common issues and solutions",
      "FAQs - How-to related questions",
      "Conclusion - Summary and next steps",
    ],
    seoTips: [
      "Target keyword 'How to [Action]'",
      "Use numbered lists for steps",
      "Add HowTo schema markup",
      "Include screenshots or diagrams",
      "Use clear, actionable language",
      "Add internal links to related resources",
    ],
    internalLinks: [
      "/colleges",
      "/courses",
      "/entrance-exams",
      "/quiz",
    ],
  },
  
  listArticle: {
    title: "List Article Template",
    structure: [
      "Introduction - Overview of the list",
      "Selection Criteria - How colleges were selected",
      "Ranked List - Each college with explanation",
      "Comparison Table - Side-by-side comparison",
      "Key Takeaways - Important points",
      "FAQs - List-related questions",
      "Conclusion - Summary and recommendations",
    ],
    seoTips: [
      "Target keyword 'Top 10 [Topic]' or 'Best [Topic]'",
      "Use numbered list format",
      "Include rankings and explanations",
      "Add comparison tables",
      "Link to individual college/course pages",
      "Include statistics and data",
    ],
    internalLinks: [
      "/colleges/[college-slug]",
      "/courses/[course-slug]",
      "/colleges/[category]",
    ],
  },
  
  dataDriven: {
    title: "Data-Driven Article Template",
    structure: [
      "Introduction - Overview of the data/trends",
      "Key Statistics - Important numbers",
      "Trends Analysis - Year-over-year comparisons",
      "Insights - What the data means",
      "Predictions - Future expectations",
      "Visualizations - Charts, graphs (if applicable)",
      "Methodology - How data was collected",
      "FAQs - Data-related questions",
      "Conclusion - Summary and implications",
    ],
    seoTips: [
      "Target keyword '[Topic] Statistics' or '[Topic] Trends'",
      "Include actual data and numbers",
      "Use tables and charts for visualization",
      "Cite sources for data",
      "Include year in title for time-sensitive content",
      "Add comparison with previous years",
    ],
    internalLinks: [
      "/colleges",
      "/courses",
      "/entrance-exams",
    ],
  },
}

/**
 * Get template by type
 */
export function getBlogTemplate(type: string): BlogTemplate | null {
  return blogTemplates[type] || null
}

/**
 * Generate content outline from template
 */
export function generateContentOutline(template: BlogTemplate, variables: Record<string, string>): string {
  let outline = `# ${template.title}\n\n`
  
  template.structure.forEach((section, index) => {
    // Replace variables in section names
    let sectionName = section
    Object.entries(variables).forEach(([key, value]) => {
      sectionName = sectionName.replace(new RegExp(`\\[${key}\\]`, "g"), value)
    })
    
    outline += `${index + 1}. ${sectionName}\n`
  })
  
  return outline
}

/**
 * Generate SEO checklist from template
 */
export function generateSEOChecklist(template: BlogTemplate): string[] {
  const baseChecklist = [
    "Primary keyword in title and first paragraph",
    "Meta description optimized (120-160 characters)",
    "H1, H2, H3 structure correct",
    "Internal links added",
    "Images optimized with alt text",
    "Content is 1500+ words",
    "FAQ section included",
    "Call-to-action included",
    "Proofread for errors",
    "Mobile-friendly formatting",
  ]
  
  return [...baseChecklist, ...template.seoTips]
}

