/**
 * AI Career Path Simulation utilities
 * Provides career path recommendations, job market predictions, and skill gap analysis
 */

export interface CareerInterest {
  field: string // e.g., "Computer Science", "Business", "Medicine"
  level: "beginner" | "intermediate" | "advanced"
  experience?: string[]
}

export interface CareerPath {
  title: string
  description: string
  requiredEducation: string[]
  requiredSkills: string[]
  averageSalary: {
    entry: number
    mid: number
    senior: number
    currency: string
  }
  jobMarketOutlook: "high" | "medium" | "low"
  growthRate: number // percentage
  typicalRoles: string[]
  progression: CareerProgression[]
}

export interface CareerProgression {
  stage: string // e.g., "Entry Level", "Mid Level", "Senior Level"
  years: string // e.g., "0-3 years", "3-7 years", "7+ years"
  roles: string[]
  skills: string[]
  salaryRange: {
    min: number
    max: number
    currency: string
  }
}

export interface SkillGap {
  skill: string
  currentLevel: "none" | "beginner" | "intermediate" | "advanced"
  requiredLevel: "beginner" | "intermediate" | "advanced"
  gap: number // 0-100, how much improvement needed
  resources: string[] // Learning resources
}

export interface CareerPathSimulation {
  recommendedPaths: CareerPath[]
  skillGaps: SkillGap[]
  marketPredictions: {
    field: string
    outlook: "high" | "medium" | "low"
    growthRate: number
    topRoles: string[]
  }[]
  timeline: {
    year: number
    milestones: string[]
    skillsToDevelop: string[]
  }[]
}

/**
 * Career path database (foundation - can be enhanced with real data)
 */
const careerPathsDatabase: Record<string, CareerPath> = {
  "software-engineer": {
    title: "Software Engineer",
    description: "Design, develop, and maintain software applications and systems",
    requiredEducation: ["Bachelor's in Computer Science", "Bachelor's in Engineering", "Master's in CS"],
    requiredSkills: ["Programming", "Data Structures", "Algorithms", "System Design", "Version Control"],
    averageSalary: {
      entry: 500000,
      mid: 1200000,
      senior: 2500000,
      currency: "INR",
    },
    jobMarketOutlook: "high",
    growthRate: 22,
    typicalRoles: ["Junior Developer", "Software Engineer", "Senior Engineer", "Tech Lead", "Engineering Manager"],
    progression: [
      {
        stage: "Entry Level",
        years: "0-2 years",
        roles: ["Junior Developer", "Associate Software Engineer"],
        skills: ["Programming fundamentals", "Version control", "Basic debugging"],
        salaryRange: { min: 300000, max: 800000, currency: "INR" },
      },
      {
        stage: "Mid Level",
        years: "2-5 years",
        roles: ["Software Engineer", "Full Stack Developer"],
        skills: ["System design", "API development", "Database design"],
        salaryRange: { min: 800000, max: 1800000, currency: "INR" },
      },
      {
        stage: "Senior Level",
        years: "5+ years",
        roles: ["Senior Engineer", "Tech Lead", "Architect"],
        skills: ["Architecture design", "Team leadership", "Mentoring"],
        salaryRange: { min: 1800000, max: 4000000, currency: "INR" },
      },
    ],
  },
  "data-scientist": {
    title: "Data Scientist",
    description: "Analyze complex data to help organizations make data-driven decisions",
    requiredEducation: ["Bachelor's in Statistics/CS", "Master's in Data Science", "PhD in related field"],
    requiredSkills: ["Python/R", "Machine Learning", "Statistics", "Data Visualization", "SQL"],
    averageSalary: {
      entry: 600000,
      mid: 1500000,
      senior: 3000000,
      currency: "INR",
    },
    jobMarketOutlook: "high",
    growthRate: 28,
    typicalRoles: ["Junior Data Analyst", "Data Scientist", "Senior Data Scientist", "ML Engineer"],
    progression: [
      {
        stage: "Entry Level",
        years: "0-2 years",
        roles: ["Data Analyst", "Junior Data Scientist"],
        skills: ["Data analysis", "SQL", "Basic statistics"],
        salaryRange: { min: 400000, max: 900000, currency: "INR" },
      },
      {
        stage: "Mid Level",
        years: "2-5 years",
        roles: ["Data Scientist", "ML Engineer"],
        skills: ["Machine learning", "Deep learning", "Model deployment"],
        salaryRange: { min: 900000, max: 2000000, currency: "INR" },
      },
      {
        stage: "Senior Level",
        years: "5+ years",
        roles: ["Senior Data Scientist", "Principal Data Scientist"],
        skills: ["Advanced ML", "Research", "Team leadership"],
        salaryRange: { min: 2000000, max: 5000000, currency: "INR" },
      },
    ],
  },
  "business-analyst": {
    title: "Business Analyst",
    description: "Bridge the gap between business needs and technical solutions",
    requiredEducation: ["Bachelor's in Business", "MBA", "Bachelor's in Engineering"],
    requiredSkills: ["Analytical thinking", "Communication", "Requirements analysis", "SQL", "Excel"],
    averageSalary: {
      entry: 400000,
      mid: 1000000,
      senior: 2000000,
      currency: "INR",
    },
    jobMarketOutlook: "medium",
    growthRate: 14,
    typicalRoles: ["Junior BA", "Business Analyst", "Senior BA", "Product Manager"],
    progression: [
      {
        stage: "Entry Level",
        years: "0-2 years",
        roles: ["Junior Business Analyst", "Associate BA"],
        skills: ["Requirements gathering", "Documentation", "Basic SQL"],
        salaryRange: { min: 300000, max: 700000, currency: "INR" },
      },
      {
        stage: "Mid Level",
        years: "2-5 years",
        roles: ["Business Analyst", "Product Analyst"],
        skills: ["Stakeholder management", "Process improvement", "Data analysis"],
        salaryRange: { min: 700000, max: 1500000, currency: "INR" },
      },
      {
        stage: "Senior Level",
        years: "5+ years",
        roles: ["Senior BA", "Product Manager", "Strategy Consultant"],
        skills: ["Strategic thinking", "Leadership", "Business strategy"],
        salaryRange: { min: 1500000, max: 3500000, currency: "INR" },
      },
    ],
  },
  "doctor": {
    title: "Medical Doctor",
    description: "Diagnose and treat patients, provide medical care",
    requiredEducation: ["MBBS", "MD/MS", "Specialization"],
    requiredSkills: ["Medical knowledge", "Patient care", "Diagnosis", "Communication", "Empathy"],
    averageSalary: {
      entry: 800000,
      mid: 2000000,
      senior: 5000000,
      currency: "INR",
    },
    jobMarketOutlook: "high",
    growthRate: 18,
    typicalRoles: ["Resident Doctor", "General Practitioner", "Specialist", "Senior Consultant"],
    progression: [
      {
        stage: "Entry Level",
        years: "0-3 years",
        roles: ["Resident Doctor", "Junior Doctor"],
        skills: ["Basic medical procedures", "Patient history", "Diagnosis"],
        salaryRange: { min: 500000, max: 1200000, currency: "INR" },
      },
      {
        stage: "Mid Level",
        years: "3-10 years",
        roles: ["General Practitioner", "Specialist"],
        skills: ["Specialized diagnosis", "Treatment planning", "Patient management"],
        salaryRange: { min: 1200000, max: 3000000, currency: "INR" },
      },
      {
        stage: "Senior Level",
        years: "10+ years",
        roles: ["Senior Consultant", "Department Head"],
        skills: ["Advanced procedures", "Mentoring", "Research"],
        salaryRange: { min: 3000000, max: 10000000, currency: "INR" },
      },
    ],
  },
  "mba-graduate": {
    title: "MBA Graduate / Business Manager",
    description: "Lead business operations, strategy, and growth",
    requiredEducation: ["Bachelor's degree", "MBA", "Specialized MBA"],
    requiredSkills: ["Leadership", "Strategic thinking", "Finance", "Marketing", "Operations"],
    averageSalary: {
      entry: 800000,
      mid: 2000000,
      senior: 5000000,
      currency: "INR",
    },
    jobMarketOutlook: "medium",
    growthRate: 12,
    typicalRoles: ["Management Trainee", "Manager", "Senior Manager", "Director", "VP"],
    progression: [
      {
        stage: "Entry Level",
        years: "0-2 years",
        roles: ["Management Trainee", "Associate Manager"],
        skills: ["Business fundamentals", "Team collaboration", "Analysis"],
        salaryRange: { min: 600000, max: 1200000, currency: "INR" },
      },
      {
        stage: "Mid Level",
        years: "2-7 years",
        roles: ["Manager", "Senior Manager"],
        skills: ["Team leadership", "Strategy execution", "P&L management"],
        salaryRange: { min: 1200000, max: 3000000, currency: "INR" },
      },
      {
        stage: "Senior Level",
        years: "7+ years",
        roles: ["Director", "VP", "C-Suite"],
        skills: ["Strategic vision", "Organizational leadership", "Business development"],
        salaryRange: { min: 3000000, max: 15000000, currency: "INR" },
      },
    ],
  },
}

/**
 * Map interests to career paths
 */
const interestToCareerMap: Record<string, string[]> = {
  "computer science": ["software-engineer", "data-scientist"],
  "engineering": ["software-engineer", "data-scientist"],
  "business": ["business-analyst", "mba-graduate"],
  "medicine": ["doctor"],
  "data": ["data-scientist", "business-analyst"],
  "management": ["mba-graduate", "business-analyst"],
  "healthcare": ["doctor"],
}

/**
 * Generate career path recommendations based on interests
 */
export function generateCareerPaths(interests: CareerInterest[]): CareerPath[] {
  const recommendedPaths: CareerPath[] = []
  const pathIds = new Set<string>()

  // Map interests to career paths
  interests.forEach((interest) => {
    const fieldLower = interest.field.toLowerCase()
    const matchingPaths = Object.entries(interestToCareerMap)
      .filter(([key]) => fieldLower.includes(key) || key.includes(fieldLower))
      .flatMap(([, paths]) => paths)

    matchingPaths.forEach((pathId) => {
      if (!pathIds.has(pathId) && careerPathsDatabase[pathId]) {
        pathIds.add(pathId)
        recommendedPaths.push(careerPathsDatabase[pathId])
      }
    })
  })

  // If no matches, return top 3 paths
  if (recommendedPaths.length === 0) {
    return [
      careerPathsDatabase["software-engineer"],
      careerPathsDatabase["business-analyst"],
      careerPathsDatabase["mba-graduate"],
    ].filter(Boolean)
  }

  return recommendedPaths.slice(0, 5)
}

/**
 * Analyze skill gaps for a career path
 */
export function analyzeSkillGaps(
  currentSkills: string[],
  targetPath: CareerPath
): SkillGap[] {
  const gaps: SkillGap[] = []

  targetPath.requiredSkills.forEach((requiredSkill) => {
    const skillLower = requiredSkill.toLowerCase()
    const hasSkill = currentSkills.some(
      (skill) => skill.toLowerCase().includes(skillLower) || skillLower.includes(skill.toLowerCase())
    )

    if (!hasSkill) {
      gaps.push({
        skill: requiredSkill,
        currentLevel: "none",
        requiredLevel: "intermediate",
        gap: 100,
        resources: [`Learn ${requiredSkill}`, `Practice ${requiredSkill}`, `Build projects with ${requiredSkill}`],
      })
    } else {
      // Skill exists but may need improvement
      gaps.push({
        skill: requiredSkill,
        currentLevel: "beginner",
        requiredLevel: "intermediate",
        gap: 50,
        resources: [`Advanced ${requiredSkill}`, `Master ${requiredSkill}`],
      })
    }
  })

  return gaps
}

/**
 * Get job market predictions for fields
 */
export function getMarketPredictions(fields: string[]): CareerPathSimulation["marketPredictions"] {
  return fields.map((field) => {
    const fieldLower = field.toLowerCase()
    let outlook: "high" | "medium" | "low" = "medium"
    let growthRate = 10

    if (fieldLower.includes("computer") || fieldLower.includes("software") || fieldLower.includes("data")) {
      outlook = "high"
      growthRate = 22
    } else if (fieldLower.includes("medicine") || fieldLower.includes("health")) {
      outlook = "high"
      growthRate = 18
    } else if (fieldLower.includes("business") || fieldLower.includes("management")) {
      outlook = "medium"
      growthRate = 12
    }

    return {
      field,
      outlook,
      growthRate,
      topRoles: getTopRolesForField(field),
    }
  })
}

function getTopRolesForField(field: string): string[] {
  const fieldLower = field.toLowerCase()
  if (fieldLower.includes("computer") || fieldLower.includes("software")) {
    return ["Software Engineer", "Full Stack Developer", "DevOps Engineer", "Cloud Architect"]
  }
  if (fieldLower.includes("data")) {
    return ["Data Scientist", "Data Analyst", "ML Engineer", "Data Engineer"]
  }
  if (fieldLower.includes("business") || fieldLower.includes("management")) {
    return ["Business Analyst", "Product Manager", "Operations Manager", "Strategy Consultant"]
  }
  if (fieldLower.includes("medicine")) {
    return ["General Practitioner", "Specialist", "Surgeon", "Medical Researcher"]
  }
  return ["Professional", "Manager", "Specialist", "Consultant"]
}

/**
 * Generate career progression timeline
 */
export function generateTimeline(
  targetPath: CareerPath,
  currentLevel: "beginner" | "intermediate" | "advanced" = "beginner"
): CareerPathSimulation["timeline"] {
  const timeline: CareerPathSimulation["timeline"] = []
  const startYear = new Date().getFullYear()

  targetPath.progression.forEach((stage, index) => {
    timeline.push({
      year: startYear + index * 3,
      milestones: [
        `Complete ${stage.stage} requirements`,
        `Acquire ${stage.skills.slice(0, 2).join(" and ")}`,
        `Apply for ${stage.roles[0]} positions`,
      ],
      skillsToDevelop: stage.skills,
    })
  })

  return timeline
}

/**
 * Generate complete career path simulation
 */
export function simulateCareerPath(
  interests: CareerInterest[],
  currentSkills: string[] = [],
  academicLevel?: string
): CareerPathSimulation {
  const recommendedPaths = generateCareerPaths(interests)
  const primaryPath = recommendedPaths[0]

  if (!primaryPath) {
    throw new Error("No career paths found for given interests")
  }

  const skillGaps = analyzeSkillGaps(currentSkills, primaryPath)
  const fields = interests.map((i) => i.field)
  const marketPredictions = getMarketPredictions(fields)
  const timeline = generateTimeline(primaryPath)

  return {
    recommendedPaths,
    skillGaps,
    marketPredictions,
    timeline,
  }
}

