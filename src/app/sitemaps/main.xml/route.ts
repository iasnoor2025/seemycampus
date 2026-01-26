import { db } from "@/db";
import { colleges, blogPosts, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAllCities } from "@/lib/colleges";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com";

    try {
        const staticUrls = ["", "/colleges", "/scholarships", "/entrance-exams", "/about", "/contact"];
        const collegesData = await db.select({ slug: colleges.slug, updatedAt: colleges.updatedAt }).from(colleges).where(eq(colleges.isEnabled, true));
        const blogsData = await db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt }).from(blogPosts).where(eq(blogPosts.isPublished, true));
        const cities = await getAllCities();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        staticUrls.forEach(url => {
            xml += `<url><loc>${baseUrl}${url}</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`;
        });

        collegesData.forEach(c => {
            xml += `<url><loc>${baseUrl}/colleges/${c.slug}</loc><lastmod>${(c.updatedAt || new Date()).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
        });

        blogsData.forEach(b => {
            xml += `<url><loc>${baseUrl}/blog/${b.slug}</loc><lastmod>${(b.updatedAt || new Date()).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
        });

        cities.forEach(city => {
            xml += `<url><loc>${baseUrl}/colleges/location/${city.toLowerCase().replace(/\s+/g, "-")}</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
        });

        xml += `</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
    } catch (e) {
        return new Response("Error", { status: 500 });
    }
}
