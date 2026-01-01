import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

async function testBBAApi() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const url = `${baseUrl}/api/colleges/featured?category=bba`
  
  console.log(`Testing BBA API endpoint: ${url}\n`)
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    console.log(`Status: ${response.status}`)
    console.log(`Found ${data.count || 0} BBA colleges\n`)
    
    if (data.colleges && data.colleges.length > 0) {
      console.log("Sample BBA colleges:")
      data.colleges.slice(0, 10).forEach((college: any, index: number) => {
        console.log(`  ${index + 1}. ${college.name} (${college.slug})`)
      })
    } else {
      console.log("No BBA colleges found!")
    }
  } catch (error) {
    console.error("Error testing API:", error)
    console.log("\nNote: Make sure your Next.js server is running on port 3000")
  }
}

testBBAApi()

