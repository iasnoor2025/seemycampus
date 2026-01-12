// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

// Create database connection directly to avoid import timing issues
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { eq } from "drizzle-orm"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

import { faqs } from "./schema"

const defaultFAQs = [
  {
    question: "What about courses?",
    answer: "Delhi offers a wide range of courses across various colleges. Popular B.Tech specializations include Civil, Electrical, and Computer Science and Engineering at colleges like Jamia Millia Islamia (JMI), Shri Devi Sri Jyotir Matha College, and Sri Aurobindo College. M.Tech programs in Civil, Electrical, and Computer Science and Engineering are available at JMI. For management programs, MBA and other postgraduate courses are offered by IIM Ahmedabad, Shri Ram College of Commerce (SRCC), and Jesus and Mary College. Undergraduate programs include BA, B.Com, and B.A. (Hons.) in various subjects at many colleges. Law programs are available at NALSAR University of Law. Explore 60,000+ institutions and 375,000+ courses on Seemycampus.",
    category: "courses",
    displayOrder: 0,
  },
  {
    question: "Tell me about JMI fee",
    answer: "Jamia Millia Islamia (JMI) fee structure: Undergraduate courses (BA, BSc, BCom) range from ₹13,500 - ₹15,000 per year. Postgraduate courses (MA, MSc, MCom) range from ₹16,800 - ₹18,300 per year. Integrated programs: BBA+MBA at ₹1,80,000 - ₹2,00,000 per year, and Integrated M.Sc. Physics/Chemistry/Biology at ₹1,30,000 - ₹1,50,000 per year. Ph.D. programs: ₹18,000 - ₹20,000 per year for fellowship students and ₹35,000 - ₹40,000 per year for self-financing students. Additional fees include: Admissions fee (₹1,000 - ₹2,000), Examination fee (₹500 - ₹1,000), and Library fee (₹500 - ₹1,000). These are general guidelines and may vary by course. Get detailed fee information on Seemycampus.",
    category: "fees",
    displayOrder: 1,
  },
  {
    question: "How do I secure MBA admission?",
    answer: "Gain work experience, ace entrance exams (GMAT/CAT/XAT), and get expert support from Seemycampus.",
    category: "admission",
    displayOrder: 2,
  },
  {
    question: "What criteria for MBA admission?",
    answer: "Accredited degree, entrance exam scores, work experience, GPA, essays, and interviews.",
    category: "admission",
    displayOrder: 3,
  },
  {
    question: "BBA program admission process?",
    answer: "12th-grade completion required. Submit transcripts, essays, recommendations, and attend interviews.",
    category: "admission",
    displayOrder: 4,
  },
  {
    question: "How to secure BBA admission?",
    answer: "Requires 12th marks (50-60%), application, documents. Seemycampus covers 60,000+ institutions.",
    category: "admission",
    displayOrder: 5,
  },
]

async function seedFAQs() {
  console.log("Seeding FAQs...")

  try {
    // Check if FAQs already exist
    const existingFAQs = await db.select().from(faqs)
    
    if (existingFAQs.length > 0) {
      console.log(`Found ${existingFAQs.length} existing FAQs.`)
      
      // Update existing FAQs or insert missing ones
      for (const faq of defaultFAQs) {
        const existing = existingFAQs.find(
          (e) => e.question.toLowerCase().trim() === faq.question.toLowerCase().trim()
        )
        
        if (existing) {
          // Update existing FAQ
          await db
            .update(faqs)
            .set({
              answer: faq.answer,
              category: faq.category,
              displayOrder: faq.displayOrder,
              isActive: true,
              isApproved: true, // Seed FAQs are pre-approved
              updatedAt: new Date(),
            })
            .where(eq(faqs.id, existing.id))
          console.log(`Updated FAQ: ${faq.question}`)
        } else {
          // Insert new FAQ - pre-approved for seed data
          await db.insert(faqs).values({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            source: "manual",
            displayOrder: faq.displayOrder,
            isActive: true,
            isApproved: true, // Seed FAQs are pre-approved
            viewCount: 0,
          })
          console.log(`Inserted FAQ: ${faq.question}`)
        }
      }
      
      console.log(`✅ Successfully processed ${defaultFAQs.length} FAQs`)
    } else {
      // Insert all FAQs if none exist - pre-approved for seed data
      for (const faq of defaultFAQs) {
        await db.insert(faqs).values({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          source: "manual",
          displayOrder: faq.displayOrder,
          isActive: true,
          isApproved: true, // Seed FAQs are pre-approved
          viewCount: 0,
        })
      }

      console.log(`✅ Successfully seeded ${defaultFAQs.length} FAQs`)
    }
  } catch (error) {
    console.error("Error seeding FAQs:", error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (require.main === module) {
  seedFAQs()
    .then(() => {
      console.log("Seed completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Seed failed:", error)
      process.exit(1)
    })
}

export { seedFAQs }
