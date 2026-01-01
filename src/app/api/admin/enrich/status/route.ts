import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

interface RequirementStatus {
  name: string
  status: "ok" | "error"
  message: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const requirements: RequirementStatus[] = []
    
    // 1. Check Environment Variables
    const aiProvider = process.env.AI_PROVIDER
    const ollamaApiUrl = process.env.OLLAMA_API_URL || "http://localhost:11434"
    const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2:latest"
    const databaseUrl = process.env.DATABASE_URL
    
    if (aiProvider !== "ollama") {
      requirements.push({
        name: "Environment Variables",
        status: "error",
        message: `AI_PROVIDER is set to "${aiProvider}" but should be "ollama"`
      })
    } else {
      requirements.push({
        name: "Environment Variables",
        status: "ok",
        message: `AI_PROVIDER=ollama is set correctly`
      })
    }
    
    // 2. Check Database Connection
    if (!databaseUrl) {
      requirements.push({
        name: "Database Connection",
        status: "error",
        message: "DATABASE_URL is not set in environment variables"
      })
    } else {
      try {
        const client = postgres(databaseUrl, { max: 1 })
        const db = drizzle(client)
        // Try a simple query
        await client`SELECT 1`
        await client.end()
        requirements.push({
          name: "Database Connection",
          status: "ok",
          message: "Database connection is working"
        })
      } catch (error: any) {
        requirements.push({
          name: "Database Connection",
          status: "error",
          message: `Cannot connect to database: ${error.message || "Connection failed"}`
        })
      }
    }
    
    // 3. Check Ollama Connection
    try {
      const response = await fetch(`${ollamaApiUrl}/api/tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })
      
      if (!response.ok) {
        requirements.push({
          name: "Ollama Running",
          status: "error",
          message: `Ollama responded with error: ${response.statusText}`
        })
      } else {
        requirements.push({
          name: "Ollama Running",
          status: "ok",
          message: `Ollama is running on ${ollamaApiUrl}`
        })
      }
    } catch (error: any) {
      if (error.name === "AbortError" || error.message?.includes("timeout")) {
        requirements.push({
          name: "Ollama Running",
          status: "error",
          message: `Cannot connect to Ollama at ${ollamaApiUrl} (timeout). Make sure Ollama is running.`
        })
      } else if (error.message?.includes("ECONNREFUSED") || error.message?.includes("fetch failed")) {
        requirements.push({
          name: "Ollama Running",
          status: "error",
          message: `Cannot connect to Ollama at ${ollamaApiUrl}. Make sure Ollama is running.`
        })
      } else {
        requirements.push({
          name: "Ollama Running",
          status: "error",
          message: `Error connecting to Ollama: ${error.message || "Unknown error"}`
        })
      }
    }
    
    // 4. Check if Model is Installed
    try {
      const response = await fetch(`${ollamaApiUrl}/api/tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      })
      
      if (response.ok) {
        const data = await response.json()
        const installedModels = (data.models || []).map((m: any) => {
          // Handle different response formats
          if (typeof m === "string") return m
          return m.name || m.model || ""
        })
        const modelBaseName = ollamaModel.split(":")[0]
        const modelInstalled = installedModels.some((name: string) => {
          if (!name) return false
          // Check exact match or base name match
          return name === ollamaModel || 
                 name === modelBaseName || 
                 name.includes(modelBaseName) ||
                 ollamaModel.includes(name.split(":")[0])
        })
        
        if (modelInstalled) {
          requirements.push({
            name: "Model Installed",
            status: "ok",
            message: `Model "${ollamaModel}" is installed`
          })
        } else {
          requirements.push({
            name: "Model Installed",
            status: "error",
            message: `Model "${ollamaModel}" is not installed. Run: ollama pull ${ollamaModel}`
          })
        }
      } else {
        requirements.push({
          name: "Model Installed",
          status: "error",
          message: "Cannot check model status (Ollama connection failed)"
        })
      }
    } catch (error: any) {
      requirements.push({
        name: "Model Installed",
        status: "error",
        message: `Cannot check model: ${error.message || "Unknown error"}`
      })
    }
    
    const allOk = requirements.every(r => r.status === "ok")
    
    return NextResponse.json({
      requirements,
      allOk,
      summary: {
        total: requirements.length,
        ok: requirements.filter(r => r.status === "ok").length,
        errors: requirements.filter(r => r.status === "error").length,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || "Failed to check requirements",
      requirements: [],
      allOk: false
    }, { status: 500 })
  }
}

