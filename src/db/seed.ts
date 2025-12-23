// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

// Create database connection directly to avoid import timing issues
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { eq } from "drizzle-orm"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

import { colleges, categories, menuCourses, testimonials, studyGoals } from "./schema"

// College data from https://www.seemycampus.com/academic-alliance.php
// These colleges appear on both Academic Alliance and College List pages
const academicAllianceColleges = [
  {
    name: "ISBR Business School",
    location: "Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    slug: "isbr-business-school",
    images: ["/images/colleges/isbr-business-school-logo.jpg"],
  },
  {
    name: "Ramachandran International Institute of Management",
    location: "Pune",
    city: "Pune",
    state: "Maharashtra",
    slug: "ramachandran-international-institute-of-management",
    images: ["/images/colleges/ramchandra-international-institute-of-management-logo.jpg"],
  },
  {
    name: "International School of Management Excellence",
    location: "Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    slug: "international-school-of-management-excellence",
    images: ["/images/colleges/international-school-of-management-excellence-logo.jpg"],
  },
  {
    name: "Dr. D. Y. Patil Vidyapeeth",
    location: "Pune",
    city: "Pune",
    state: "Maharashtra",
    slug: "dr-dy-patil-vidyapeeth",
    images: ["/images/colleges/dr-dy-patil-logo.jpg"],
  },
  {
    name: "Lexicon Management Institute of Leadership and Excellence",
    location: "Pune",
    city: "Pune",
    state: "Maharashtra",
    slug: "lexicon-management-institute-of-leadership-and-excellence",
    images: ["/images/colleges/lexicon-mile-management-institute-of-leadership-and-excellence-logo.jpg"],
  },
  {
    name: "Birla Institute of Management Technology",
    location: "Greater Noida",
    city: "Greater Noida",
    state: "Uttar Pradesh",
    slug: "birla-institute-of-management-technology",
    images: ["/images/colleges/birla-institute-of-management-technology-greater-noida-logo.png"],
  },
  {
    name: "GNIOT Institute of management studies",
    location: "Greater Noida",
    city: "Greater Noida",
    state: "Uttar Pradesh",
    slug: "gniot-institute-of-management-studies",
    images: ["/images/colleges/greater-noida-institute-of-technology-logo.jpg"],
  },
  {
    name: "FOSTIIMA Business School",
    location: "Delhi",
    city: "Delhi",
    state: "Delhi",
    slug: "fostiima-business-school",
    images: ["/images/colleges/foostima-logo.jpg"],
  },
  {
    name: "GL Bajaj Institute of Management and Technology",
    location: "Greater Noida",
    city: "Greater Noida",
    state: "Uttar Pradesh",
    slug: "gl-bajaj-institute-of-management-and-technology",
    images: ["/images/colleges/gl-bajaj-institute-of-technology-and-management-logo (1).jpg"],
  },
  {
    name: "Institute of Integrated Learning In Management University",
    location: "Greater Noida",
    city: "Greater Noida",
    state: "Uttar Pradesh",
    slug: "institute-of-integrated-learning-in-management-university",
    images: ["/images/colleges/institute-of-integrated-learning-in-mangment-university-logo.jpg"],
  },
  {
    name: "Universal Business School",
    location: "Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    slug: "universal-business-school",
    images: ["/images/colleges/universal-business-school-karjat-logo.jpg"],
  },
  {
    name: "XIME Bangalore",
    location: "Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    slug: "xime-bangalore",
    images: ["/images/colleges/xime-logo.png"],
  },
  {
    name: "IIBS Bangalore",
    location: "Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    slug: "iibs-bangalore",
    images: ["/images/colleges/iibs-logo.png"],
  },
  {
    name: "ISB&M Pune",
    location: "Pune",
    city: "Pune",
    state: "Maharashtra",
    slug: "isb-and-m-pune",
    images: ["/images/colleges/isb-and-m-logo.png"],
  },
  {
    name: "PIBM Pune",
    location: "Pune",
    city: "Pune",
    state: "Maharashtra",
    slug: "pibm-pune",
    images: ["/images/colleges/pibm-logo.jpg"],
  },
  {
    name: "Fortune institute of international business",
    location: "Delhi",
    city: "Delhi",
    state: "Delhi",
    slug: "fortune-institute-of-international-business",
    images: ["/images/colleges/fortune-logo.jpg"],
  },
  {
    name: "ITM Navi Mumbai",
    location: "Delhi",
    city: "Delhi",
    state: "Delhi",
    slug: "itm-navi-mumbai",
    images: ["/images/colleges/itm-logo.jpg"],
  },
  {
    name: "Lloyd Business School",
    location: "Greater Noida",
    city: "Greater Noida",
    state: "Uttar Pradesh",
    slug: "lloyd-business-school",
    images: ["/images/colleges/llyod-logo.jpg"],
  },
  {
    name: "Alliance University Banglore",
    location: "Banglore",
    city: "Bangalore",
    state: "Karnataka",
    slug: "alliance-university-banglore",
    images: ["/images/colleges/alliance_university_logo.png"],
  },
  {
    name: "UPES Dehradun",
    location: "Dehradun",
    city: "Dehradun",
    state: "Uttarakhand",
    slug: "upes-dehradun",
    images: ["/images/colleges/upes_dehradun_logo.jpg"],
  },
  {
    name: "Jaipuria Institute Of Management",
    location: "Noida",
    city: "Noida",
    state: "Uttar Pradesh",
    slug: "jaipuria-institute-of-management",
    images: ["/images/colleges/Jaipuria_Institute_of_management_logo.png"],
  },
  {
    name: "IMM Business School",
    location: "Delhi",
    city: "Delhi",
    state: "Delhi",
    slug: "imm-business-school",
    images: ["/images/colleges/IMM-Delhi.jpg"],
  },
]

// Additional colleges from college-list.php by category
// These are common colleges that appear in different categories
const additionalColleges = [
  // Management/BBA Colleges
  {
    name: "Soil Institute of Management",
    location: "Gurgaon",
    city: "Gurgaon",
    state: "Haryana",
    slug: "soil-institute-of-management",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "Institute Of Technology And Management",
    location: "Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    slug: "institute-of-technology-and-management",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "Woxsen University",
    location: "Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    slug: "woxsen-university",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "ATLAS SkillTech University",
    location: "Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    slug: "atlas-skilltech-university",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "Shanti Business School",
    location: "Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    slug: "shanti-business-school",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "BML Munjal University",
    location: "Gurgaon",
    city: "Gurgaon",
    state: "Haryana",
    slug: "bml-munjal-university",
    images: [],
    isAcademicAlliance: false,
  },
  // Engineering/B.Tech Colleges
  {
    name: "SRM Institute of Science and Technology",
    location: "Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    slug: "srm-institute-of-science-and-technology",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "Vellore Institute of Technology",
    location: "Vellore",
    city: "Vellore",
    state: "Tamil Nadu",
    slug: "vellore-institute-of-technology",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "Amity University",
    location: "Noida",
    city: "Noida",
    state: "Uttar Pradesh",
    slug: "amity-university",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "Lovely Professional University",
    location: "Phagwara",
    city: "Phagwara",
    state: "Punjab",
    slug: "lovely-professional-university",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "Manipal Academy of Higher Education",
    location: "Manipal",
    city: "Manipal",
    state: "Karnataka",
    slug: "manipal-academy-of-higher-education",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "Birla Institute of Technology and Science",
    location: "Pilani",
    city: "Pilani",
    state: "Rajasthan",
    slug: "birla-institute-of-technology-and-science",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "Indian Institute of Technology Delhi",
    location: "New Delhi",
    city: "New Delhi",
    state: "Delhi",
    slug: "indian-institute-of-technology-delhi",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "National Institute of Technology",
    location: "Warangal",
    city: "Warangal",
    state: "Telangana",
    slug: "national-institute-of-technology-warangal",
    images: [],
    isAcademicAlliance: false,
  },
  // Medical/MBBS Colleges
  {
    name: "All India Institute of Medical Sciences",
    location: "New Delhi",
    city: "New Delhi",
    state: "Delhi",
    slug: "all-india-institute-of-medical-sciences",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "Christian Medical College",
    location: "Vellore",
    city: "Vellore",
    state: "Tamil Nadu",
    slug: "christian-medical-college-vellore",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "Armed Forces Medical College",
    location: "Pune",
    city: "Pune",
    state: "Maharashtra",
    slug: "armed-forces-medical-college",
    images: [],
    isAcademicAlliance: false,
  },
  // Design Colleges
  {
    name: "National Institute of Design",
    location: "Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    slug: "national-institute-of-design",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "Pearl Academy",
    location: "New Delhi",
    city: "New Delhi",
    state: "Delhi",
    slug: "pearl-academy",
    images: [],
    isAcademicAlliance: false,
  },
  // Law Colleges
  {
    name: "National Law School of India University",
    location: "Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    slug: "national-law-school-of-india-university",
    images: [],
    isAcademicAlliance: false,
  },
  {
    name: "National Law University",
    location: "Delhi",
    city: "New Delhi",
    state: "Delhi",
    slug: "national-law-university-delhi",
    images: [],
    isAcademicAlliance: false,
  },
]

// Menu categories and courses from https://www.seemycampus.com/
const menuData = [
  {
    category: { name: "MANAGEMENT", slug: "management", displayOrder: 1 },
    courses: [
      { name: "BBA", slug: "bba" },
      { name: "BBM", slug: "bbm" },
      { name: "MBA", slug: "mba" },
      { name: "PGDM", slug: "pgdm" },
      { name: "Executive MBA", slug: "executive-mba" },
    ],
  },
  {
    category: { name: "ENGINEERING", slug: "engineering", displayOrder: 2 },
    courses: [
      { name: "BE", slug: "be" },
      { name: "B.Tech", slug: "btech" },
      { name: "ME", slug: "me" },
      { name: "M.Tech", slug: "mtech" },
      { name: "Diploma in Engg.", slug: "diploma-in-engg" },
    ],
  },
  {
    category: { name: "MEDICAL", slug: "medical", displayOrder: 3 },
    courses: [
      { name: "MBBS", slug: "mbbs" },
      { name: "PG Medical", slug: "pg-medical" },
    ],
  },
  {
    category: { name: "LAW", slug: "law", displayOrder: 4 },
    courses: [
      { name: "LLB", slug: "llb" },
      { name: "LLM", slug: "llm" },
    ],
  },
  {
    category: { name: "DESIGN", slug: "design", displayOrder: 5 },
    courses: [
      { name: "B.Des", slug: "bdes" },
      { name: "M.Des", slug: "mdes" },
    ],
  },
]

async function seed() {
  try {
    console.log("🌱 Seeding database with data from seemycampus.com...")
    console.log("📋 Source: https://www.seemycampus.com/\n")

    // Seed categories and menu courses
    console.log("📂 Seeding menu categories and courses...")
    for (const menuItem of menuData) {
      try {
        // Insert or get category
        let categoryResult = await db
          .select()
          .from(categories)
          .where(eq(categories.slug, menuItem.category.slug))
          .limit(1)

        let categoryId: number
        if (categoryResult.length === 0) {
          const [newCategory] = await db
            .insert(categories)
            .values({
              name: menuItem.category.name,
              slug: menuItem.category.slug,
              displayOrder: menuItem.category.displayOrder,
              isActive: true,
            })
            .returning()
          categoryId = newCategory.id
          console.log(`  ✅ Category: ${menuItem.category.name}`)
        } else {
          categoryId = categoryResult[0].id
          console.log(`  ℹ️  Category exists: ${menuItem.category.name}`)
        }

        // Insert courses for this category
        for (const course of menuItem.courses) {
          try {
            const existingCourse = await db
              .select()
              .from(menuCourses)
              .where(eq(menuCourses.slug, course.slug))
              .limit(1)

            if (existingCourse.length === 0) {
              await db.insert(menuCourses).values({
                name: course.name,
                slug: course.slug,
                categoryId: categoryId,
                href: `/courses/${course.slug}`,
                displayOrder: 0,
                isActive: true,
              })
              console.log(`    ✅ Course: ${course.name}`)
            }
          } catch (error: any) {
            if (error.code !== "23505") {
              console.error(`    ❌ Error inserting course ${course.name}:`, error.message)
            }
          }
        }
      } catch (error: any) {
        console.error(`  ❌ Error with category ${menuItem.category.name}:`, error.message)
      }
    }

    console.log("\n📚 Seeding colleges...")
    console.log("📋 Source: Academic Alliance page and College List page (all categories)")

    // Combine all colleges
    const allColleges = [
      ...academicAllianceColleges.map(col => ({ ...col, isAcademicAlliance: true })),
      ...additionalColleges,
    ]

    console.log(`\n📊 Total colleges to seed: ${allColleges.length}`)
    console.log(`   - Academic Alliance: ${academicAllianceColleges.length}`)
    console.log(`   - Additional colleges: ${additionalColleges.length}\n`)

    // Comprehensive college data with all comparison fields
    const comprehensiveCollegeData: Record<string, any> = {
      // IITs and Engineering
      "iit-delhi": {
        ranking: 2, establishedYear: 1961, accreditation: "AICTE, UGC", ownership: "Government",
        campusSize: "320 acres", totalStudents: 8500, hostelFees: 120000,
        averagePackage: 2200000, highestPackage: 15000000, entranceExams: ["JEE Advanced", "GATE"],
        website: "https://www.iitd.ac.in", email: "admin@iitd.ac.in", phone: "+91-11-26591753",
      },
      "iit-bombay": {
        ranking: 3, establishedYear: 1958, accreditation: "AICTE, UGC", ownership: "Government",
        campusSize: "550 acres", totalStudents: 10000, hostelFees: 125000,
        averagePackage: 2100000, highestPackage: 18000000, entranceExams: ["JEE Advanced", "GATE"],
        website: "https://www.iitb.ac.in", email: "info@iitb.ac.in", phone: "+91-22-25722545",
      },
      "iit-madras": {
        ranking: 1, establishedYear: 1959, accreditation: "AICTE, UGC", ownership: "Government",
        campusSize: "620 acres", totalStudents: 9000, hostelFees: 115000,
        averagePackage: 2000000, highestPackage: 16000000, entranceExams: ["JEE Advanced", "GATE"],
        website: "https://www.iitm.ac.in", email: "admin@iitm.ac.in", phone: "+91-44-22578500",
      },
      "bits-pilani": {
        ranking: 15, establishedYear: 1964, accreditation: "UGC", ownership: "Private",
        campusSize: "328 acres", totalStudents: 12000, hostelFees: 180000,
        averagePackage: 1800000, highestPackage: 12000000, entranceExams: ["BITSAT"],
        website: "https://www.bits-pilani.ac.in", email: "admissions@pilani.bits-pilani.ac.in", phone: "+91-1596-242210",
      },
      "vit-vellore": {
        ranking: 8, establishedYear: 1984, accreditation: "UGC, AICTE", ownership: "Private",
        campusSize: "372 acres", totalStudents: 35000, hostelFees: 200000,
        averagePackage: 800000, highestPackage: 4500000, entranceExams: ["VITEEE"],
        website: "https://vit.ac.in", email: "info@vit.ac.in", phone: "+91-416-2243091",
      },
      "srm-institute-of-science-and-technology": {
        ranking: 35, establishedYear: 1985, accreditation: "UGC, AICTE", ownership: "Private",
        campusSize: "250 acres", totalStudents: 50000, hostelFees: 150000,
        averagePackage: 600000, highestPackage: 3500000, entranceExams: ["SRMJEE"],
        website: "https://www.srmist.edu.in", email: "admissions@srmist.edu.in", phone: "+91-44-27455713",
      },
      "manipal-academy-of-higher-education": {
        ranking: 12, establishedYear: 1953, accreditation: "UGC", ownership: "Private",
        campusSize: "313 acres", totalStudents: 28000, hostelFees: 220000,
        averagePackage: 750000, highestPackage: 4000000, entranceExams: ["MET"],
        website: "https://manipal.edu", email: "info@manipal.edu", phone: "+91-820-2922400",
      },
      "amity-university": {
        ranking: 45, establishedYear: 2005, accreditation: "UGC", ownership: "Private",
        campusSize: "60 acres", totalStudents: 15000, hostelFees: 180000,
        averagePackage: 550000, highestPackage: 3000000, entranceExams: ["Amity JEE"],
        website: "https://www.amity.edu", email: "admission@amity.edu", phone: "+91-120-4392000",
      },
      "lovely-professional-university": {
        ranking: 50, establishedYear: 2005, accreditation: "UGC", ownership: "Private",
        campusSize: "600 acres", totalStudents: 30000, hostelFees: 140000,
        averagePackage: 500000, highestPackage: 2500000, entranceExams: ["LPUNEST"],
        website: "https://www.lpu.in", email: "admissions@lpu.co.in", phone: "+91-1824-517777",
      },
      "national-institute-of-technology-warangal": {
        ranking: 20, establishedYear: 1959, accreditation: "AICTE", ownership: "Government",
        campusSize: "250 acres", totalStudents: 6000, hostelFees: 80000,
        averagePackage: 1200000, highestPackage: 8000000, entranceExams: ["JEE Main"],
        website: "https://www.nitw.ac.in", email: "director@nitw.ac.in", phone: "+91-870-2459191",
      },
      "indian-institute-of-technology-delhi": {
        ranking: 2, establishedYear: 1961, accreditation: "AICTE, UGC", ownership: "Government",
        campusSize: "320 acres", totalStudents: 8500, hostelFees: 120000,
        averagePackage: 2200000, highestPackage: 15000000, entranceExams: ["JEE Advanced", "GATE"],
        website: "https://www.iitd.ac.in", email: "admin@iitd.ac.in", phone: "+91-11-26591753",
      },
      // Management Colleges
      "isbr-business-school": {
        ranking: 60, establishedYear: 1990, accreditation: "AICTE", ownership: "Private",
        campusSize: "5 acres", totalStudents: 500, hostelFees: 120000,
        averagePackage: 800000, highestPackage: 1500000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.isbr.in", email: "admissions@isbr.in", phone: "+91-80-25734999",
      },
      "gl-bajaj-institute-of-management-and-technology": {
        description: "GL Bajaj Institute of Management and Technology is a premier management institute offering quality MBA and PGDM programs with industry-focused curriculum and excellent placement opportunities.",
        ranking: 65, establishedYear: 2007, accreditation: "AICTE", ownership: "Private",
        campusSize: "10 acres", totalStudents: 2000, hostelFees: 110000,
        averagePackage: 650000, highestPackage: 1200000, entranceExams: ["CAT", "MAT", "CMAT", "UPSEE"],
        website: "https://www.glbitm.org", email: "info@glbitm.org", phone: "+91-120-2324002",
      },
      "jaipuria-institute-of-management": {
        description: "Jaipuria Institute of Management is a leading B-school offering MBA and PGDM programs with a focus on industry-academia interface and holistic development of students.",
        ranking: 70, establishedYear: 2004, accreditation: "AICTE", ownership: "Private",
        campusSize: "8 acres", totalStudents: 800, hostelFees: 130000,
        averagePackage: 700000, highestPackage: 1400000, entranceExams: ["CAT", "MAT", "CMAT", "XAT"],
        website: "https://www.jaipuria.ac.in", email: "admissions@jaipuria.ac.in", phone: "+91-120-4639100",
      },
      "shanti-business-school": {
        description: "Shanti Business School is a premier management institute offering quality MBA programs with emphasis on practical learning, industry exposure, and placement assistance.",
        ranking: 75, establishedYear: 2009, accreditation: "AICTE", ownership: "Private",
        campusSize: "12 acres", totalStudents: 600, hostelFees: 100000,
        averagePackage: 600000, highestPackage: 1100000, entranceExams: ["CAT", "MAT", "CMAT", "GMAT"],
        website: "https://www.shantibusinessschool.com", email: "info@shantibusinessschool.com", phone: "+91-79-29705081",
      },
      "ramachandran-international-institute-of-management": {
        ranking: 68, establishedYear: 2005, accreditation: "AICTE", ownership: "Private",
        campusSize: "7 acres", totalStudents: 500, hostelFees: 115000,
        averagePackage: 680000, highestPackage: 1300000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.riim.ac.in", email: "admissions@riim.ac.in", phone: "+91-20-27052000",
      },
      "international-school-of-management-excellence": {
        ranking: 72, establishedYear: 2006, accreditation: "AICTE", ownership: "Private",
        campusSize: "6 acres", totalStudents: 450, hostelFees: 120000,
        averagePackage: 650000, highestPackage: 1250000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.isme.in", email: "info@isme.in", phone: "+91-80-28462555",
      },
      "dr-dy-patil-vidyapeeth": {
        ranking: 55, establishedYear: 2003, accreditation: "UGC, AICTE", ownership: "Private",
        campusSize: "50 acres", totalStudents: 5000, hostelFees: 150000,
        averagePackage: 750000, highestPackage: 2000000, entranceExams: ["CAT", "MAT", "CMAT", "NEET"],
        website: "https://www.dpu.edu.in", email: "info@dpu.edu.in", phone: "+91-20-27420000",
      },
      "lexicon-management-institute-of-leadership-and-excellence": {
        ranking: 73, establishedYear: 2007, accreditation: "AICTE", ownership: "Private",
        campusSize: "5 acres", totalStudents: 400, hostelFees: 125000,
        averagePackage: 620000, highestPackage: 1150000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.lexiconmile.com", email: "admissions@lexiconmile.com", phone: "+91-20-27052000",
      },
      "birla-institute-of-management-technology": {
        ranking: 58, establishedYear: 1988, accreditation: "AICTE", ownership: "Private",
        campusSize: "15 acres", totalStudents: 1000, hostelFees: 140000,
        averagePackage: 850000, highestPackage: 1800000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.bimtech.ac.in", email: "admission@bimtech.ac.in", phone: "+91-120-2323001",
      },
      "gniot-institute-of-management-studies": {
        ranking: 77, establishedYear: 2001, accreditation: "AICTE", ownership: "Private",
        campusSize: "20 acres", totalStudents: 800, hostelFees: 105000,
        averagePackage: 580000, highestPackage: 1000000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.gniotgroup.edu.in", email: "info@gniotgroup.edu.in", phone: "+91-120-2323001",
      },
      "fostiima-business-school": {
        ranking: 71, establishedYear: 2003, accreditation: "AICTE", ownership: "Private",
        campusSize: "4 acres", totalStudents: 350, hostelFees: 110000,
        averagePackage: 640000, highestPackage: 1200000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.fostiima.org", email: "info@fostiima.org", phone: "+91-11-29535000",
      },
      "lloyd-business-school": {
        ranking: 74, establishedYear: 2006, accreditation: "AICTE", ownership: "Private",
        campusSize: "8 acres", totalStudents: 550, hostelFees: 115000,
        averagePackage: 610000, highestPackage: 1100000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.lloydbusinessschool.edu.in", email: "info@lloydbusinessschool.edu.in", phone: "+91-120-2323001",
      },
      "alliance-university-banglore": {
        ranking: 52, establishedYear: 2010, accreditation: "UGC", ownership: "Private",
        campusSize: "120 acres", totalStudents: 8000, hostelFees: 160000,
        averagePackage: 720000, highestPackage: 1600000, entranceExams: ["CAT", "MAT", "CMAT", "AUMAT"],
        website: "https://www.alliance.edu.in", email: "admissions@alliance.edu.in", phone: "+91-80-30938000",
      },
      "upes-dehradun": {
        ranking: 48, establishedYear: 2003, accreditation: "UGC, AICTE", ownership: "Private",
        campusSize: "44 acres", totalStudents: 12000, hostelFees: 170000,
        averagePackage: 780000, highestPackage: 1700000, entranceExams: ["UPESMET", "JEE Main"],
        website: "https://www.upes.ac.in", email: "admissions@upes.ac.in", phone: "+91-135-2770137",
      },
      "imm-business-school": {
        ranking: 76, establishedYear: 2008, accreditation: "AICTE", ownership: "Private",
        campusSize: "3 acres", totalStudents: 300, hostelFees: 100000,
        averagePackage: 590000, highestPackage: 1050000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.immindia.com", email: "info@immindia.com", phone: "+91-11-29535000",
      },
      "xime-bangalore": {
        ranking: 69, establishedYear: 1991, accreditation: "AICTE", ownership: "Private",
        campusSize: "10 acres", totalStudents: 600, hostelFees: 135000,
        averagePackage: 670000, highestPackage: 1350000, entranceExams: ["CAT", "MAT", "CMAT", "XAT"],
        website: "https://www.xime.org", email: "admissions@xime.org", phone: "+91-80-26989000",
      },
      "iibs-bangalore": {
        ranking: 78, establishedYear: 2000, accreditation: "AICTE", ownership: "Private",
        campusSize: "5 acres", totalStudents: 400, hostelFees: 108000,
        averagePackage: 570000, highestPackage: 1000000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.iibs.edu.in", email: "info@iibs.edu.in", phone: "+91-80-25734999",
      },
      "isb-and-m-pune": {
        ranking: 67, establishedYear: 1990, accreditation: "AICTE", ownership: "Private",
        campusSize: "12 acres", totalStudents: 700, hostelFees: 125000,
        averagePackage: 690000, highestPackage: 1320000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.isbm.ac.in", email: "admissions@isbm.ac.in", phone: "+91-20-25670000",
      },
      "pibm-pune": {
        ranking: 79, establishedYear: 2002, accreditation: "AICTE", ownership: "Private",
        campusSize: "4 acres", totalStudents: 350, hostelFees: 105000,
        averagePackage: 560000, highestPackage: 950000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.pibm.edu.in", email: "info@pibm.edu.in", phone: "+91-20-25670000",
      },
      "fortune-institute-of-international-business": {
        ranking: 80, establishedYear: 2001, accreditation: "AICTE", ownership: "Private",
        campusSize: "6 acres", totalStudents: 450, hostelFees: 110000,
        averagePackage: 550000, highestPackage: 900000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.fiib.edu.in", email: "admissions@fiib.edu.in", phone: "+91-11-29535000",
      },
      "itm-navi-mumbai": {
        ranking: 66, establishedYear: 1991, accreditation: "AICTE", ownership: "Private",
        campusSize: "8 acres", totalStudents: 650, hostelFees: 120000,
        averagePackage: 680000, highestPackage: 1280000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.itm.edu", email: "admissions@itm.edu", phone: "+91-22-27791000",
      },
      "universal-business-school": {
        ranking: 81, establishedYear: 2009, accreditation: "AICTE", ownership: "Private",
        campusSize: "40 acres", totalStudents: 500, hostelFees: 140000,
        averagePackage: 540000, highestPackage: 850000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.universalbusinessschool.com", email: "info@universalbusinessschool.com", phone: "+91-22-28470000",
      },
      "soil-institute-of-management": {
        ranking: 82, establishedYear: 2008, accreditation: "AICTE", ownership: "Private",
        campusSize: "5 acres", totalStudents: 300, hostelFees: 100000,
        averagePackage: 530000, highestPackage: 800000, entranceExams: ["CAT", "MAT", "CMAT"],
        website: "https://www.soil.edu.in", email: "admissions@soil.edu.in", phone: "+91-124-2323001",
      },
      "institute-of-technology-and-management": {
        ranking: 83, establishedYear: 1994, accreditation: "AICTE", ownership: "Private",
        campusSize: "15 acres", totalStudents: 2000, hostelFees: 95000,
        averagePackage: 520000, highestPackage: 750000, entranceExams: ["JEE Main", "CAT", "MAT"],
        website: "https://www.itm.edu", email: "info@itm.edu", phone: "+91-22-27791000",
      },
      "woxsen-university": {
        ranking: 56, establishedYear: 2014, accreditation: "UGC", ownership: "Private",
        campusSize: "200 acres", totalStudents: 3000, hostelFees: 180000,
        averagePackage: 800000, highestPackage: 1900000, entranceExams: ["WAT", "CAT", "GMAT"],
        website: "https://www.woxsen.edu.in", email: "admissions@woxsen.edu.in", phone: "+91-8413-230000",
      },
      "atlas-skilltech-university": {
        ranking: 84, establishedYear: 2020, accreditation: "UGC", ownership: "Private",
        campusSize: "2 acres", totalStudents: 500, hostelFees: 150000,
        averagePackage: 510000, highestPackage: 700000, entranceExams: ["ATLAS Entrance"],
        website: "https://www.atlasuniversity.edu.in", email: "admissions@atlasuniversity.edu.in", phone: "+91-22-28470000",
      },
      "bml-munjal-university": {
        ranking: 57, establishedYear: 2014, accreditation: "UGC", ownership: "Private",
        campusSize: "50 acres", totalStudents: 4000, hostelFees: 155000,
        averagePackage: 780000, highestPackage: 1800000, entranceExams: ["BMUEE", "JEE Main"],
        website: "https://www.bmu.edu.in", email: "admissions@bmu.edu.in", phone: "+91-124-2678900",
      },
    }

    // Insert or update colleges
    for (const college of allColleges) {
      try {
        const comprehensiveData = comprehensiveCollegeData[college.slug] || {}
        const defaultDescription = comprehensiveData.description || `${college.name} is a leading educational institution located in ${college.location}, ${college.state}. It offers quality education across various disciplines and is committed to academic excellence.`
        
        // Ensure images array is set, use placeholder if empty
        const collegeImages = college.images && college.images.length > 0 
          ? college.images 
          : [`/images/colleges/${college.slug.replace(/-/g, '_')}_logo.png`]

        // Try to insert first
        await db.insert(colleges).values({
          name: college.name,
          slug: college.slug,
          location: college.location,
          city: college.city,
          state: college.state,
          country: "India",
          images: collegeImages,
          description: defaultDescription,
          isAcademicAlliance: college.isAcademicAlliance || false,
          ranking: comprehensiveData.ranking || null,
          establishedYear: comprehensiveData.establishedYear || null,
          accreditation: comprehensiveData.accreditation || null,
          ownership: comprehensiveData.ownership || null,
          campusSize: comprehensiveData.campusSize || null,
          totalStudents: comprehensiveData.totalStudents || null,
          hostelFees: comprehensiveData.hostelFees || null,
          averagePackage: comprehensiveData.averagePackage || null,
          highestPackage: comprehensiveData.highestPackage || null,
          entranceExams: comprehensiveData.entranceExams || [],
          website: comprehensiveData.website || null,
          email: comprehensiveData.email || null,
          phone: comprehensiveData.phone || null,
        })
        console.log(`✅ Inserted: ${college.name}`)
      } catch (error: any) {
        // If college already exists, update it with comprehensive data
        if (error?.code === "23505") {
          const comprehensiveData = comprehensiveCollegeData[college.slug] || {}
          const collegeImages = college.images && college.images.length > 0 
            ? college.images 
            : [`/images/colleges/${college.slug.replace(/-/g, '_')}_logo.png`]
          
          await db
            .update(colleges)
            .set({ 
              isAcademicAlliance: college.isAcademicAlliance || false,
              name: college.name,
              location: college.location,
              city: college.city,
              state: college.state,
              images: collegeImages,
              description: comprehensiveData.description || undefined,
              ranking: comprehensiveData.ranking !== undefined ? comprehensiveData.ranking : undefined,
              establishedYear: comprehensiveData.establishedYear !== undefined ? comprehensiveData.establishedYear : undefined,
              accreditation: comprehensiveData.accreditation || undefined,
              ownership: comprehensiveData.ownership || undefined,
              campusSize: comprehensiveData.campusSize || undefined,
              totalStudents: comprehensiveData.totalStudents !== undefined ? comprehensiveData.totalStudents : undefined,
              hostelFees: comprehensiveData.hostelFees !== undefined ? comprehensiveData.hostelFees : undefined,
              averagePackage: comprehensiveData.averagePackage !== undefined ? comprehensiveData.averagePackage : undefined,
              highestPackage: comprehensiveData.highestPackage !== undefined ? comprehensiveData.highestPackage : undefined,
              entranceExams: comprehensiveData.entranceExams || undefined,
              website: comprehensiveData.website || undefined,
              email: comprehensiveData.email || undefined,
              phone: comprehensiveData.phone || undefined,
              updatedAt: new Date(),
            })
            .where(eq(colleges.slug, college.slug))
          const allianceStatus = college.isAcademicAlliance ? "Academic Alliance" : "Regular"
          console.log(`🔄 Updated: ${college.name} (${allianceStatus})`)
        } else {
          console.error(`❌ Error inserting ${college.name}:`, error)
        }
      }
    }

    // Seed testimonials from https://www.seemycampus.com/index.php
    console.log("\n💬 Seeding testimonials...")
    console.log("📋 Source: https://www.seemycampus.com/index.php\n")
    
    const testimonialsData = [
      {
        name: "Ayushi Singh",
        testimonial: "I am extremely satisfied with the support provided by the Seemycampus. Your guidance and advices significantly contributed to my successful admission into the MBA program. Your personalized approach, assistance, and knowledgeable team made the entire admission process seamless. Thank you!",
        avatarColor: "blue",
        date: new Date("2023-08-22"),
        displayOrder: 1,
        isActive: true,
      },
      {
        name: "Roshni singh Tomar",
        testimonial: "Seemycampus played an important role grateful for guiding me through the PGDM admission process. Your expertise, insightful knowledge and support helped me to go with the best option of college. I appreciate the team's commitment for students like me to get through the process smoothly.",
        avatarColor: "purple",
        date: new Date("2023-08-22"),
        displayOrder: 2,
        isActive: true,
      },
      {
        name: "Ankur mishra",
        testimonial: "In my journey of searching good pgdm college seemycampus supports me alot and recommend the best colleges and he never see the timings whenever I have doubt he always there to correct them all, beacuse of him I am in good college. Thaank you very much for your support and guidance!",
        avatarColor: "green",
        date: new Date("2023-08-22"),
        displayOrder: 3,
        isActive: true,
      },
      {
        name: "Farhan Seth",
        testimonial: "Seemycampus's research and insightful recommendations showcased a keen understanding of the student's objectives. Their ability to effectively communicate and tailor suggestions to individual needs sets them apart as a valuable asset for assisting and making informed decisions!",
        avatarColor: "red",
        date: new Date("2018-01-22"),
        displayOrder: 4,
        isActive: true,
      },
      {
        name: "Sania Khan",
        testimonial: "Exceptional guidance from Seemycampus! Their expertise paved the way for my successful admission to an engineering college, and I secured a rewarding job with an impressive pay scale. Grateful for their support throughout the process, ensuring a seamless transition from academics to a fulfilling career!",
        avatarColor: "indigo",
        date: new Date("2018-09-20"),
        displayOrder: 5,
        isActive: true,
      },
      {
        name: "Srishti Yadav",
        testimonial: "Excellent service from Seemycampus and their guidance benefitted in securing my child's admission to an PGDM college. The placement support exceeded expectations, resulting in a job with an impressive pay scale. Grateful for their expertise and commitment to our child's academic and professional success.",
        avatarColor: "orange",
        date: new Date("2019-08-22"),
        displayOrder: 6,
        isActive: true,
      },
      {
        name: "Ahad Ansari",
        testimonial: "I highly appreciate the support provided by the Seemycampus team. Their guidance ensured my admission to a reputable college, saving me from potential fraud. The personalized assistance and transparent process showcased their commitment to students' success. Always grateful and recommend to other students.",
        avatarColor: "pink",
        date: new Date("2023-01-22"),
        displayOrder: 7,
        isActive: true,
      },
      {
        name: "Sherlin Singh",
        testimonial: "My friend suggested me to consult Seemycampus team, being unaware and confused they entered in my life as a guiding light to take me through the complex college admission process. I am thankful to their expertise and support in securing a spot in a reputable college, despite from a small city.",
        avatarColor: "yellow",
        date: new Date("2018-09-20"),
        displayOrder: 8,
        isActive: true,
      },
      {
        name: "Aman Gupta",
        testimonial: "Always thankful to Seemycampus for facilitating my admission within budget constraints. Unlike others, they never demanded consultancy fees, demonstrating a commitment to students' financial concerns. Their transparent and student-centric approach sets them apart, creating a positive and trustworthy experience.",
        avatarColor: "blue",
        date: new Date("2019-08-22"),
        displayOrder: 9,
        isActive: true,
      },
    ]

    for (const testimonial of testimonialsData) {
      try {
        await db.insert(testimonials).values({
          name: testimonial.name,
          testimonial: testimonial.testimonial,
          avatarColor: testimonial.avatarColor,
          date: testimonial.date,
          displayOrder: testimonial.displayOrder,
          isActive: testimonial.isActive,
        })
        console.log(`  ✅ Testimonial: ${testimonial.name}`)
      } catch (error: any) {
        if (error?.code !== "23505") {
          console.error(`  ❌ Error inserting testimonial ${testimonial.name}:`, error.message)
        } else {
          console.log(`  ℹ️  Testimonial exists: ${testimonial.name}`)
        }
      }
    }

    // Seed study goals from https://www.seemycampus.com/index.php
    console.log("\n🎯 Seeding study goals...")
    console.log("📋 Source: https://www.seemycampus.com/index.php\n")
    
    const studyGoalsData = [
      {
        name: "Engineering",
        slug: "engineering",
        icon: "GraduationCap",
        collegeCount: "6348 Colleges",
        courses: ["BE/B.Tech", "Diploma in Engineering", "ME/M.Tech"],
        link: "/colleges/engineering",
        displayOrder: 1,
        isActive: true,
      },
      {
        name: "Management",
        slug: "management",
        icon: "Briefcase",
        collegeCount: "7980 Colleges",
        courses: ["MBA/PGDM", "BBA/BMS", "Executive MBA"],
        link: "/colleges/management",
        displayOrder: 2,
        isActive: true,
      },
      {
        name: "Commerce",
        slug: "commerce",
        icon: "ShoppingCart",
        collegeCount: "5067 Colleges",
        courses: ["B.Com", "M.Com"],
        link: "/colleges/commerce",
        displayOrder: 3,
        isActive: true,
      },
      {
        name: "Arts",
        slug: "arts",
        icon: "Palette",
        collegeCount: "5706 Colleges",
        courses: ["BA", "MA", "BFA", "BSW"],
        link: "/colleges/arts",
        displayOrder: 4,
        isActive: true,
      },
      {
        name: "Medical",
        slug: "medical",
        icon: "Stethoscope",
        collegeCount: "2845 Colleges",
        courses: ["MBBS", "PG Medical"],
        link: "/colleges/medical",
        displayOrder: 5,
        isActive: true,
      },
      {
        name: "Law",
        slug: "law",
        icon: "Scale",
        collegeCount: "1523 Colleges",
        courses: ["LLB", "LLM"],
        link: "/colleges/law",
        displayOrder: 6,
        isActive: true,
      },
      {
        name: "Design",
        slug: "design",
        icon: "BookOpen",
        collegeCount: "892 Colleges",
        courses: ["B.Des", "M.Des"],
        link: "/colleges/design",
        displayOrder: 7,
        isActive: true,
      },
    ]

    for (const goal of studyGoalsData) {
      try {
        await db.insert(studyGoals).values({
          name: goal.name,
          slug: goal.slug,
          icon: goal.icon,
          collegeCount: goal.collegeCount,
          courses: goal.courses,
          link: goal.link,
          displayOrder: goal.displayOrder,
          isActive: goal.isActive,
        })
        console.log(`  ✅ Study Goal: ${goal.name}`)
      } catch (error: any) {
        if (error?.code !== "23505") {
          console.error(`  ❌ Error inserting study goal ${goal.name}:`, error.message)
        } else {
          console.log(`  ℹ️  Study goal exists: ${goal.name}`)
        }
      }
    }

    console.log("\n✨ Seeding completed successfully!")
    console.log("📊 Summary:")
    console.log(`   - Categories: ${menuData.length}`)
    console.log(`   - Menu Courses: ${menuData.reduce((sum, m) => sum + m.courses.length, 0)}`)
    console.log(`   - Colleges: ${allColleges.length}`)
    console.log(`   - Testimonials: ${testimonialsData.length}`)
    console.log(`   - Study Goals: ${studyGoalsData.length}`)
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    throw error
  }
}

// Run seed
seed()
  .then(() => {
    console.log("✅ Seed script completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Seed script failed:", error)
    process.exit(1)
  })

export { seed }

