import { config } from "dotenv"
import { sql } from "drizzle-orm"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"

// Load environment variables FIRST
config()

async function testDatabaseConnection() {
  console.log("Testing database connection...")
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✓ Set" : "✗ Not set")
  
  if (!process.env.DATABASE_URL) {
    console.error("\n✗ DATABASE_URL environment variable is not set")
    console.error("\nPlease set DATABASE_URL in your .env file")
    process.exit(1)
  }
  
  const connectionString = process.env.DATABASE_URL
  const client = postgres(connectionString)
  const db = drizzle(client)
  
  try {
    // Test basic connection
    const result = await db.execute(sql`SELECT NOW() as current_time, version() as pg_version`)
    console.log("\n✓ Database connection successful!")
    console.log("Current time:", result[0]?.current_time)
    console.log("PostgreSQL version:", result[0]?.pg_version?.toString().split("\n")[0])
    
    // Test if we can query a table
    try {
      const tablesResult = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `)
      console.log("\n✓ Available tables:")
      const tables = tablesResult.map((row: any) => row.table_name)
      console.log(tables.length > 0 ? tables.join(", ") : "No tables found")
      
      // Check for specific tables we need
      const requiredTables = ['site_settings', 'feature_flags', 'colleges']
      console.log("\n✓ Checking required tables:")
      requiredTables.forEach(table => {
        const exists = tables.includes(table)
        console.log(`  ${exists ? '✓' : '✗'} ${table}`)
      })
      
    } catch (error: any) {
      console.log("\n⚠ Could not list tables:", error.message)
    }
    
    // Test site_settings table specifically
    try {
      const siteSettingsResult = await db.execute(sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'site_settings'
        ORDER BY ordinal_position
      `)
      if (siteSettingsResult.length > 0) {
        console.log("\n✓ site_settings table structure:")
        siteSettingsResult.forEach((row: any) => {
          console.log(`  - ${row.column_name} (${row.data_type})`)
        })
        
        // Try to query contact settings
        const contactSettings = await db.execute(sql`
          SELECT key, value 
          FROM site_settings 
          WHERE category = 'contact'
        `)
        console.log("\n✓ Contact settings in database:")
        if (contactSettings.length > 0) {
          contactSettings.forEach((row: any) => {
            console.log(`  - ${row.key}: ${row.value || '(empty)'}`)
          })
        } else {
          console.log("  No contact settings found")
        }
      } else {
        console.log("\n✗ site_settings table does not exist")
      }
    } catch (error: any) {
      console.log("\n✗ Error checking site_settings:", error.message)
    }
    
    // Check for google_place_id column in colleges table
    try {
      const collegesColumns = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'colleges' AND column_name = 'google_place_id'
      `)
      if (collegesColumns.length > 0) {
        console.log("\n✓ google_place_id column exists in colleges table")
      } else {
        console.log("\n⚠ google_place_id column does NOT exist in colleges table")
      }
    } catch (error: any) {
      console.log("\n⚠ Could not check google_place_id column:", error.message)
    }
    
    // Close connection
    await client.end()
    
  } catch (error: any) {
    console.error("\n✗ Database connection failed!")
    console.error("Error:", error.message)
    console.error("\nTroubleshooting:")
    console.error("1. Check if DATABASE_URL is set correctly")
    console.error("2. Verify database server is running")
    console.error("3. Check network connectivity")
    console.error("4. Verify database credentials are correct")
    await client.end()
    process.exit(1)
  }
  
  process.exit(0)
}

testDatabaseConnection()
