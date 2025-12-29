import { config } from "dotenv"
import { resolve } from "path"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { eq } from "drizzle-orm"
import * as schema from "./schema"

config({ path: resolve(process.cwd(), ".env") })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

const { leads } = schema

// Generate 20 test leads with varied data
const testLeads = [
  { name: "John Doe", email: "john.doe@example.com", phone: "+919876543210", source: "form" as const, status: "new" as const },
  { name: "Jane Smith", email: "jane.smith@example.com", phone: "+919876543211", source: "quiz" as const, status: "new" as const },
  { name: "Raj Kumar", email: "raj.kumar@example.com", phone: "+919876543212", source: "form" as const, status: "contacted" as const },
  { name: "Priya Sharma", email: "priya.sharma@example.com", phone: "+919876543213", source: "chat" as const, status: "new" as const },
  { name: "Amit Patel", email: "amit.patel@example.com", phone: "+919876543214", source: "quiz" as const, status: "qualified" as const },
  { name: "Sneha Reddy", email: "sneha.reddy@example.com", phone: "+919876543215", source: "form" as const, status: "new" as const },
  { name: "Vikram Singh", email: "vikram.singh@example.com", phone: "+919876543216", source: "direct" as const, status: "contacted" as const },
  { name: "Anjali Mehta", email: "anjali.mehta@example.com", phone: "+919876543217", source: "quiz" as const, status: "new" as const },
  { name: "Rahul Verma", email: "rahul.verma@example.com", phone: "+919876543218", source: "form" as const, status: "qualified" as const },
  { name: "Kavita Nair", email: "kavita.nair@example.com", phone: "+919876543219", source: "chat" as const, status: "new" as const },
  { name: "Mohit Agarwal", email: "mohit.agarwal@example.com", phone: "+919876543220", source: "quiz" as const, status: "new" as const },
  { name: "Divya Joshi", email: "divya.joshi@example.com", phone: "+919876543221", source: "form" as const, status: "contacted" as const },
  { name: "Arjun Malhotra", email: "arjun.malhotra@example.com", phone: "+919876543222", source: "direct" as const, status: "new" as const },
  { name: "Pooja Iyer", email: "pooja.iyer@example.com", phone: "+919876543223", source: "quiz" as const, status: "qualified" as const },
  { name: "Suresh Menon", email: "suresh.menon@example.com", phone: "+919876543224", source: "form" as const, status: "new" as const },
  { name: "Neha Kapoor", email: "neha.kapoor@example.com", phone: "+919876543225", source: "chat" as const, status: "new" as const },
  { name: "Ravi Thakur", email: "ravi.thakur@example.com", phone: "+919876543226", source: "quiz" as const, status: "contacted" as const },
  { name: "Meera Desai", email: "meera.desai@example.com", phone: "+919876543227", source: "form" as const, status: "new" as const },
  { name: "Karan Shah", email: "karan.shah@example.com", phone: "+919876543228", source: "direct" as const, status: "qualified" as const },
  { name: "Shreya Bhatt", email: "shreya.bhatt@example.com", phone: "+919876543229", source: "quiz" as const, status: "new" as const },
]

async function seedLeads() {
  try {
    console.log("🌱 Seeding 20 test leads...\n")

    let created = 0
    let skipped = 0

    for (const lead of testLeads) {
      try {
        // Check if lead with same email already exists
        const existing = await db
          .select()
          .from(leads)
          .where(eq(leads.email, lead.email))
          .limit(1)

        if (existing.length > 0) {
          console.log(`  ℹ️  Lead already exists: ${lead.name} (${lead.email})`)
          skipped++
          continue
        }

        // Add some quiz data for quiz leads
        const quizData = lead.source === "quiz" ? {
          interests: ["Engineering", "Technology"],
          preferredLocation: "Bangalore",
          budgetMin: 50000,
          budgetMax: 200000,
          academicLevel: "undergraduate",
        } : null

        await db.insert(leads).values({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          status: lead.status,
          quizData: quizData,
          phoneVerified: false,
        })

        console.log(`  ✅ Created lead: ${lead.name} (${lead.email}) - ${lead.source} - ${lead.status}`)
        created++
      } catch (error: any) {
        if (error?.code === "23505") {
          // Unique constraint violation
          console.log(`  ℹ️  Lead already exists: ${lead.name} (${lead.email})`)
          skipped++
        } else {
          console.error(`  ❌ Error creating lead ${lead.name}:`, error.message)
        }
      }
    }

    console.log(`\n✨ Seeding complete!`)
    console.log(`   Created: ${created} leads`)
    console.log(`   Skipped: ${skipped} leads (already exist)`)
    console.log(`   Total: ${testLeads.length} leads\n`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding leads:", error)
    process.exit(1)
  }
}

seedLeads()

