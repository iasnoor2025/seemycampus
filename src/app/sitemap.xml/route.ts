import { db } from "@/db";
import { courses } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com";

    try {
        // 1. Get total course count to see how many chunks we need
        const [result] = await db.select({ count: sql<number>`count(*)` }).from(courses);
        const totalCourses = Number(result?.count || 0);
        const COURSES_PER_FILE = 40000;
        const chunkCount = Math.ceil(totalCourses / COURSES_PER_FILE);

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add the main sitemap for static pages and colleges
        xml += `
  <sitemap>
    <loc>${baseUrl}/sitemaps/main.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;

        // Add a sitemap for each course chunk
        for (let i = 1; i <= chunkCount; i++) {
            xml += `
  <sitemap>
    <loc>${baseUrl}/sitemaps/courses/${i}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
        }

        xml += `
</sitemapindex>`;

        return new Response(xml, {
            headers: {
                "Content-Type": "application/xml",
            },
        });
    } catch (error) {
        console.error("Sitemap Index Error:", error);
        return new Response("Error generating sitemap index", { status: 500 });
    }
}
