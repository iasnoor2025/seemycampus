import { db } from "@/db";
import { courses } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com";
    const idStr = (await params).id.replace(".xml", "");
    const id = parseInt(idStr);

    if (isNaN(id)) {
        return new Response("Invalid sitemap ID", { status: 400 });
    }

    try {
        const COURSES_PER_FILE = 40000;
        const offset = (id - 1) * COURSES_PER_FILE;

        const data = await db
            .select({ slug: courses.slug, updatedAt: courses.updatedAt })
            .from(courses)
            .orderBy(asc(courses.id))
            .limit(COURSES_PER_FILE)
            .offset(offset);

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        data.forEach(c => {
            xml += `
  <url>
    <loc>${baseUrl}/courses/${c.slug}</loc>
    <lastmod>${(c.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
        });

        xml += `
</urlset>`;

        return new Response(xml, {
            headers: {
                "Content-Type": "application/xml",
            },
        });
    } catch (error) {
        console.error(`Course Sitemap Shard ${id} Error:`, error);
        return new Response("Error", { status: 500 });
    }
}
