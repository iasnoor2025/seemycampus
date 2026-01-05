// Comprehensive College Discovery Script
// This script uses Ollama AI to discover colleges across all Indian states
// and systematically add them to the database

import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

import { discoverCollegesComprehensive } from "../src/db/ollama-enrich-data"
import { removeDuplicates } from "../src/db/remove-duplicates"

async function main() {
  console.log("=".repeat(60))
  console.log("🚀 COMPREHENSIVE COLLEGE DISCOVERY")
  console.log("=".repeat(60))
  console.log("\nThis script will:")
  console.log("1. Discover colleges across all 28 states + 8 union territories")
  console.log("2. Discover colleges in major cities")
  console.log("3. Remove duplicates")
  console.log("4. Add all discovered colleges to the database")
  console.log("\n⚠️  This process may take several hours due to:")
  console.log("   - Processing 36 states/UTs")
  console.log("   - Processing 20 major cities")
  console.log("   - Rate limiting to avoid overwhelming Ollama")
  console.log("\n" + "=".repeat(60) + "\n")

  try {
    // Step 1: Comprehensive Discovery
    console.log("STEP 1: Discovering Colleges Across India")
    console.log("=".repeat(60))
    const discoveryResult = await discoverCollegesComprehensive()
    
    console.log("\n" + "=".repeat(60))
    console.log("STEP 2: Removing Duplicates")
    console.log("=".repeat(60))
    const duplicateResult = await removeDuplicates(false) // Don't close connection yet
    
    console.log("\n" + "=".repeat(60))
    console.log("✨ COMPREHENSIVE DISCOVERY COMPLETED!")
    console.log("=".repeat(60))
    console.log("\n📊 Final Summary:")
    console.log(`   - States/UTs processed: ${discoveryResult.statesProcessed}`)
    console.log(`   - Colleges added: ${discoveryResult.added}`)
    console.log(`   - Colleges skipped: ${discoveryResult.skipped}`)
    console.log(`   - Duplicates removed: ${duplicateResult?.duplicatesRemoved || 0}`)
    console.log(`   - Courses merged: ${duplicateResult?.coursesMerged || 0}`)
    console.log("\n💡 Next Steps:")
    console.log("   - Run enrichment script to add detailed data: npm run enrich")
    console.log("   - Check the database for final college count")
    console.log("\n" + "=".repeat(60))
    
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Comprehensive discovery failed:", error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

