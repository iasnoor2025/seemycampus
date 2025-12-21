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

import { colleges } from "./schema"

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

async function seed() {
  try {
    console.log("🌱 Seeding database with colleges from seemycampus.com...")
    console.log("📋 Source: Academic Alliance page and College List page (all categories)")

    // Combine all colleges
    const allColleges = [
      ...academicAllianceColleges.map(col => ({ ...col, isAcademicAlliance: true })),
      ...additionalColleges,
    ]

    console.log(`\n📊 Total colleges to seed: ${allColleges.length}`)
    console.log(`   - Academic Alliance: ${academicAllianceColleges.length}`)
    console.log(`   - Additional colleges: ${additionalColleges.length}\n`)

    // Insert or update colleges
    for (const college of allColleges) {
      try {
        // Try to insert first
        await db.insert(colleges).values({
          name: college.name,
          slug: college.slug,
          location: college.location,
          city: college.city,
          state: college.state,
          country: "India",
          images: college.images,
          description: `${college.name} is a leading educational institution located in ${college.location}, ${college.state}.`,
          isAcademicAlliance: college.isAcademicAlliance || false,
        })
        console.log(`✅ Inserted: ${college.name}`)
      } catch (error: any) {
        // If college already exists, update it to mark as Academic Alliance
        if (error?.code === "23505") {
          await db
            .update(colleges)
            .set({ 
              isAcademicAlliance: college.isAcademicAlliance || false,
              name: college.name,
              location: college.location,
              city: college.city,
              state: college.state,
              images: college.images,
            })
            .where(eq(colleges.slug, college.slug))
          const allianceStatus = college.isAcademicAlliance ? "Academic Alliance" : "Regular"
          console.log(`🔄 Updated: ${college.name} (${allianceStatus})`)
        } else {
          console.error(`❌ Error inserting ${college.name}:`, error)
        }
      }
    }

    console.log("✨ Seeding completed!")
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

