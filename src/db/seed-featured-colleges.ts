// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

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

// Featured colleges by category - real colleges from India
const featuredCollegesByCategory = {
  medical: [
    {
      name: "All India Institute of Medical Sciences",
      location: "New Delhi",
      city: "New Delhi",
      state: "Delhi",
      slug: "aiims-new-delhi",
      description: "AIIMS Delhi is India's premier medical institute, established in 1956. It offers MBBS, MD, MS, and various super-specialty courses.",
    },
    {
      name: "Maulana Azad Medical College",
      location: "New Delhi",
      city: "New Delhi",
      state: "Delhi",
      slug: "maulana-azad-medical-college",
      description: "MAMC is one of the top government medical colleges in India, affiliated with Delhi University.",
    },
    {
      name: "Christian Medical College",
      location: "Vellore",
      city: "Vellore",
      state: "Tamil Nadu",
      slug: "christian-medical-college-vellore",
      description: "CMC Vellore is a premier medical college and hospital, known for excellence in medical education and healthcare.",
    },
    {
      name: "King George's Medical University",
      location: "Lucknow",
      city: "Lucknow",
      state: "Uttar Pradesh",
      slug: "king-georges-medical-university",
      description: "KGMU is one of the oldest and most prestigious medical institutions in India, established in 1911.",
    },
    {
      name: "JIPMER Puducherry",
      location: "Puducherry",
      city: "Puducherry",
      state: "Puducherry",
      slug: "jipmer-puducherry",
      description: "Jawaharlal Institute of Postgraduate Medical Education and Research is an institute of national importance.",
    },
  ],
  law: [
    {
      name: "National Law School of India University",
      location: "Bangalore",
      city: "Bangalore",
      state: "Karnataka",
      slug: "nlsiu-bangalore",
      description: "NLSIU Bangalore is India's first National Law University, established in 1986. It offers BA LLB, LLM, and PhD programs.",
    },
    {
      name: "NALSAR University of Law",
      location: "Hyderabad",
      city: "Hyderabad",
      state: "Telangana",
      slug: "nalsar-university-of-law",
      description: "NALSAR is one of India's premier law universities, known for excellence in legal education and research.",
    },
    {
      name: "National Law University",
      location: "Delhi",
      city: "New Delhi",
      state: "Delhi",
      slug: "nlu-delhi",
      description: "NLU Delhi is a leading law university offering BA LLB, LLM, and PhD programs with a focus on interdisciplinary legal education.",
    },
    {
      name: "National Law University",
      location: "Jodhpur",
      city: "Jodhpur",
      state: "Rajasthan",
      slug: "nlu-jodhpur",
      description: "NLU Jodhpur is renowned for its BA LLB, LLM, and PhD programs, with strong emphasis on corporate and commercial law.",
    },
    {
      name: "Gujarat National Law University",
      location: "Gandhinagar",
      city: "Gandhinagar",
      state: "Gujarat",
      slug: "gnlu-gandhinagar",
      description: "GNLU is a premier law university offering integrated BA LLB, BBA LLB, LLM, and PhD programs.",
    },
  ],
  design: [
    {
      name: "National Institute of Design",
      location: "Ahmedabad",
      city: "Ahmedabad",
      state: "Gujarat",
      slug: "nid-ahmedabad",
      description: "NID Ahmedabad is India's premier design institute, established in 1961. It offers B.Des, M.Des, and PhD programs in various design disciplines.",
    },
    {
      name: "National Institute of Fashion Technology",
      location: "New Delhi",
      city: "New Delhi",
      state: "Delhi",
      slug: "nift-new-delhi",
      description: "NIFT Delhi is India's leading fashion institute, offering undergraduate and postgraduate programs in fashion, design, and technology.",
    },
    {
      name: "Srishti Institute of Art, Design and Technology",
      location: "Bangalore",
      city: "Bangalore",
      state: "Karnataka",
      slug: "srishti-institute-of-art-design",
      description: "Srishti is a leading design school offering B.Des, M.Des, and PhD programs with a focus on innovation and creativity.",
    },
    {
      name: "MIT Institute of Design",
      location: "Pune",
      city: "Pune",
      state: "Maharashtra",
      slug: "mit-institute-of-design",
      description: "MIT Institute of Design offers comprehensive design education with programs in industrial design, communication design, and more.",
    },
    {
      name: "Pearl Academy",
      location: "New Delhi",
      city: "New Delhi",
      state: "Delhi",
      slug: "pearl-academy",
      description: "Pearl Academy is a leading design and fashion institute offering undergraduate and postgraduate programs in design, fashion, and media.",
    },
  ],
}

async function seedFeaturedColleges() {
  console.log("🌱 Starting Featured Colleges Seeding...")
  console.log("📋 Adding colleges for Medical, Law, and Design categories\n")

  try {
    let totalAdded = 0
    let totalSkipped = 0

    // Seed colleges for each category
    for (const [category, collegesList] of Object.entries(featuredCollegesByCategory)) {
      console.log(`\n📚 Processing ${category.toUpperCase()} colleges...`)

      for (const collegeData of collegesList) {
        // Check if college already exists
        const existing = await db
          .select()
          .from(colleges)
          .where(eq(colleges.slug, collegeData.slug))
          .limit(1)

        if (existing.length > 0) {
          console.log(`   ⏭️  Skipped: ${collegeData.name} (already exists)`)
          totalSkipped++
          continue
        }

        // Insert new college
        await db.insert(colleges).values({
          name: collegeData.name,
          slug: collegeData.slug,
          location: collegeData.location,
          city: collegeData.city,
          state: collegeData.state,
          country: "India",
          description: collegeData.description,
          images: [],
          isAcademicAlliance: false,
        })

        console.log(`   ✅ Added: ${collegeData.name}`)
        totalAdded++
      }
    }

    console.log("\n" + "=".repeat(50))
    console.log(`✅ Seeding completed!`)
    console.log(`   Added: ${totalAdded} colleges`)
    console.log(`   Skipped: ${totalSkipped} colleges (already exist)`)
    console.log("=".repeat(50))
  } catch (error) {
    console.error("❌ Error seeding featured colleges:", error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (require.main === module) {
  seedFeaturedColleges()
    .then(() => {
      console.log("\n✨ Done!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error)
      process.exit(1)
    })
}

export { seedFeaturedColleges }

