// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

import { enrichAllColleges } from "./ollama-enrich-data"

// Run if called directly (from command line)
if (require.main === module) {
  // Import from Linkingsky first, then enrich all colleges
  enrichAllColleges({ importLinkingsky: true })
    .then(() => {
      console.log("\n✅ Enrichment with college import completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Enrichment with college import failed:", error)
      process.exit(1)
    })
}


