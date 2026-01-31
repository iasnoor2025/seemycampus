
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { siteSettings } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            // Allow public access for GET, but maybe restrict if sensitive?
            // For stats, it's public data.
        }

        const { searchParams } = new URL(request.url)
        const keysParam = searchParams.get("keys")

        let query = db.select().from(siteSettings)

        if (keysParam) {
            const keys = keysParam.split(",")
            // @ts-ignore
            query = query.where(inArray(siteSettings.key, keys))
        }

        const settings = await query

        // Convert array to object for easier consumption
        const settingsMap: Record<string, string> = {}
        settings.forEach(setting => {
            if (setting.value) settingsMap[setting.key] = setting.value
        })

        return NextResponse.json(settingsMap)
    } catch (error) {
        console.error("Error fetching site settings:", error)
        return NextResponse.json(
            { error: "Failed to fetch site settings" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify admin role if needed (assuming auth() handles basic session, role check might be needed)
        // if (session.user.role !== 'admin') ...

        const body = await request.json()
        const updates: Record<string, string> = body

        const results = []

        for (const [key, value] of Object.entries(updates)) {
            // Check if setting exists
            const existing = await db
                .select()
                .from(siteSettings)
                .where(eq(siteSettings.key, key))
                .limit(1)

            if (existing.length > 0) {
                // Update
                const updated = await db
                    .update(siteSettings)
                    .set({
                        value,
                        updatedAt: new Date()
                    })
                    .where(eq(siteSettings.key, key))
                    .returning()
                results.push(updated[0])
            } else {
                // Insert
                const inserted = await db
                    .insert(siteSettings)
                    .values({
                        key,
                        value,
                        label: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), // Auto-generate label
                        category: 'general'
                    })
                    .returning()
                results.push(inserted[0])
            }
        }

        // Revalidate the home page so stats update immediately
        revalidatePath('/')

        return NextResponse.json({ message: "Settings updated", settings: results })
    } catch (error) {
        console.error("Error updating site settings:", error)
        return NextResponse.json(
            { error: "Failed to update site settings" },
            { status: 500 }
        )
    }
}
