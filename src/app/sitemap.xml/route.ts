import { db } from "@/db";
import { courses, colleges, blogPosts, categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com";

    try {
        const staticUrls = [
            "",
            "/colleges",
            "/scholarships",
            "/entrance-exams",
            "/about",
            "/contact",
        ];

        const collegesData = await db.select({ slug: colleges.slug, updatedAt: colleges.updatedAt }).from(colleges).where(eq(colleges.isEnabled, true));
        const coursesData = await db.select({ slug: courses.slug, updatedAt: courses.updatedAt }).from(courses).limit(45000);
        const blogsData = await db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt }).from(blogPosts).where(eq(blogPosts.isPublished, true));

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Static
        staticUrls.forEach(url => {
            xml += `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${url === "" ? "1.0" : "0.9"}</priority>
  </url>`;
        });

        // Colleges
        collegesData.forEach(c => {
            xml += `
  <url>
    <loc>${baseUrl}/colleges/${c.slug}</loc>
    <lastmod>${(c.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        // Blogs
        blogsData.forEach(b => {
            xml += `
  <url>
    <loc>${baseUrl}/blog/${b.slug}</loc>
    <lastmod>${(b.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        // Courses
        coursesData.forEach(c => {
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
        console.error("Manual Sitemap Route Error:", error);
        return new Response("Error generating sitemap", { status: 500 });
    }
}
