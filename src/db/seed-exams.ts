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

import { entranceExams } from "./schema"

const examsData = [
  {
    name: "CAT (Common Admission Test)",
    slug: "cat",
    description: "The Common Admission Test (CAT) is a computer-based test for admission in graduate management programs. The test consists of three sections: Verbal Ability and Reading Comprehension, Data Interpretation and Logical Reasoning, and Quantitative Ability.",
    examDate: new Date("2025-11-23"),
    registrationStartDate: new Date("2025-08-01"),
    registrationEndDate: new Date("2025-09-20"),
    resultDate: new Date("2026-01-05"),
    officialWebsite: "https://iimcat.ac.in",
    eligibility: "Bachelor's degree with at least 50% marks or equivalent CGPA (45% for SC/ST/PwD).",
    examPattern: "Computer-based test with 66 questions to be answered in 120 minutes.",
    isActive: true,
  },
  {
    name: "JEE Main (Joint Entrance Examination)",
    slug: "jee-main",
    description: "Joint Entrance Examination – Main is an all-India examination conducted by the National Testing Agency (NTA). It is the first step for admission to NITs, IIITs, and other centrally funded technical institutions.",
    examDate: new Date("2026-01-24"),
    registrationStartDate: new Date("2025-11-01"),
    registrationEndDate: new Date("2025-12-04"),
    resultDate: new Date("2026-02-12"),
    officialWebsite: "https://jeemain.nta.nic.in",
    eligibility: "Passed Class 12 or equivalent in 2024, 2025, or appearing in 2026.",
    examPattern: "Objective type questions (MCQs and Numerical Value Questions).",
    isActive: true,
  },
  {
    name: "NEET (National Eligibility cum Entrance Test)",
    slug: "neet",
    description: "The National Eligibility cum Entrance Test (Undergraduate) is an all-India pre-medical entrance test for students who wish to pursue undergraduate medical (MBBS), dental (BDS), and AYUSH courses.",
    examDate: new Date("2026-05-05"),
    registrationStartDate: new Date("2026-02-09"),
    registrationEndDate: new Date("2026-03-09"),
    resultDate: new Date("2026-06-14"),
    officialWebsite: "https://neet.nta.nic.in",
    eligibility: "Passed Class 12 with Physics, Chemistry, Biology/Biotechnology, and English.",
    examPattern: "Pen and Paper-based test with 200 multiple-choice questions.",
    isActive: true,
  },
  {
    name: "CLAT (Common Law Admission Test)",
    slug: "clat",
    description: "Common Law Admission Test is a centralized national-level entrance test for admissions to 22 National Law Universities in India.",
    examDate: new Date("2025-12-01"),
    registrationStartDate: new Date("2025-07-01"),
    registrationEndDate: new Date("2025-10-15"),
    resultDate: new Date("2025-12-10"),
    officialWebsite: "https://consortiumofnlus.ac.in",
    eligibility: "Passed Class 12 with at least 45% marks (40% for SC/ST).",
    examPattern: "Offline test with 120 multiple-choice questions.",
    isActive: true,
  },
  {
    name: "MAT (Management Aptitude Test)",
    slug: "mat",
    description: "Management Aptitude Test is a standard national-level test conducted by AIMA for admission to MBA and allied programs in over 600 business schools across India.",
    examDate: new Date("2025-12-07"),
    registrationStartDate: new Date("2025-10-01"),
    registrationEndDate: new Date("2025-11-30"),
    resultDate: new Date("2025-12-25"),
    officialWebsite: "https://mat.aima.in",
    eligibility: "Graduates in any discipline. Final year students can also apply.",
    examPattern: "Multiple modes (PBT, CBT, IBT) with 200 questions.",
    isActive: true,
  },
  {
    name: "XAT (Xavier Aptitude Test)",
    slug: "xat",
    description: "XAT is a national-level management entrance examination conducted by XLRI Jamshedpur for admission to MBA/PGDM programs.",
    examDate: new Date("2026-01-05"),
    registrationStartDate: new Date("2025-07-15"),
    registrationEndDate: new Date("2025-11-30"),
    resultDate: new Date("2026-01-20"),
    officialWebsite: "https://xatonline.in",
    eligibility: "Bachelor's degree in any discipline.",
    examPattern: "Computer-based test with sections on Decision Making and GK.",
    isActive: true,
  },
  {
    name: "GATE (Graduate Aptitude Test in Engineering)",
    slug: "gate",
    description: "GATE is an examination that primarily tests the comprehensive understanding of various undergraduate subjects in engineering and science.",
    examDate: new Date("2026-02-01"),
    registrationStartDate: new Date("2025-08-24"),
    registrationEndDate: new Date("2025-09-26"),
    resultDate: new Date("2026-03-16"),
    officialWebsite: "https://gate.iitk.ac.in",
    eligibility: "Currently in 3rd year or higher of any undergraduate degree program.",
    examPattern: "Computer-based test (CBT) with 65 questions.",
    isActive: true,
  }
]

async function seedExams() {
  try {
    console.log("🌱 Seeding entrance exams...")

    for (const exam of examsData) {
      try {
        const existing = await db
          .select()
          .from(entranceExams)
          .where(eq(entranceExams.slug, exam.slug))
          .limit(1)

        if (existing.length === 0) {
          await db.insert(entranceExams).values(exam)
          console.log(`  ✅ Inserted: ${exam.name}`)
        } else {
          await db
            .update(entranceExams)
            .set({
              ...exam,
              updatedAt: new Date(),
            })
            .where(eq(entranceExams.slug, exam.slug))
          console.log(`  🔄 Updated: ${exam.name}`)
        }
      } catch (error: any) {
        console.error(`  ❌ Error seeding ${exam.name}:`, error.message)
      }
    }

    console.log("\n✨ Entrance exams seeding completed!")
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    throw error
  }
}

seedExams()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

