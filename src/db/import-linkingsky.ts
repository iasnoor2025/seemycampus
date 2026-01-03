// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

import { fetchUniversitiesFromLinkingsky } from "./ollama-enrich-data"

// Run if called directly (from command line)
if (require.main === module) {
  fetchUniversitiesFromLinkingsky()
    .then((result) => {
      console.log("\n✅ Linkingsky import script completed successfully")
      console.log(JSON.stringify(result, null, 2))
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Linkingsky import script failed:", error)
      process.exit(1)
    })
}

