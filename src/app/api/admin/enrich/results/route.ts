import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/db/schema"
import { eq, sql, gte } from "drizzle-orm"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

import { colleges, courses, collegeReviews } from "@/db/schema"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get time range from query params (default: last 24 hours)
    const hours = parseInt(request.nextUrl.searchParams.get("hours") || "24")
    const sinceDate = new Date()
    sinceDate.setHours(sinceDate.getHours() - hours)
    
    // Get statistics
    const totalColleges = await db.select({ count: sql<number>`count(*)` }).from(colleges)
    const totalCourses = await db.select({ count: sql<number>`count(*)` }).from(courses)
    const totalReviews = await db.select({ count: sql<number>`count(*)` }).from(collegeReviews)
    
    // Get recently updated colleges (in the last X hours)
    const recentlyUpdatedColleges = await db
      .select()
      .from(colleges)
      .where(gte(colleges.updatedAt, sinceDate))
      .orderBy(colleges.updatedAt)
      .limit(50)
    
    // Get colleges with recently added courses
    const collegesWithNewCourses = await db
      .select({
        collegeId: courses.collegeId,
        collegeName: colleges.name,
        coursesCount: sql<number>`count(${courses.id})`,
      })
      .from(courses)
      .innerJoin(colleges, eq(courses.collegeId, colleges.id))
      .where(gte(courses.createdAt, sinceDate))
      .groupBy(courses.collegeId, colleges.name)
      .limit(50)
    
    // Get colleges with recently added reviews
    const collegesWithNewReviews = await db
      .select({
        collegeId: collegeReviews.collegeId,
        collegeName: colleges.name,
        reviewsCount: sql<number>`count(${collegeReviews.id})`,
        avgRating: sql<number>`avg(${collegeReviews.rating})`,
      })
      .from(collegeReviews)
      .innerJoin(colleges, eq(collegeReviews.collegeId, colleges.id))
      .where(gte(collegeReviews.createdAt, sinceDate))
      .groupBy(collegeReviews.collegeId, colleges.name)
      .limit(50)
    
    // Get summary statistics
    const summary = {
      totalColleges: Number(totalColleges[0]?.count || 0),
      totalCourses: Number(totalCourses[0]?.count || 0),
      totalReviews: Number(totalReviews[0]?.count || 0),
      recentlyUpdatedColleges: recentlyUpdatedColleges.length,
      collegesWithNewCourses: collegesWithNewCourses.length,
      collegesWithNewReviews: collegesWithNewReviews.length,
      timeRange: hours,
      sinceDate: sinceDate.toISOString(),
    }
    
    return NextResponse.json({
      summary,
      recentlyUpdatedColleges: recentlyUpdatedColleges.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        city: c.city,
        state: c.state,
        updatedAt: c.updatedAt,
        hasDescription: !!c.description,
        hasImages: c.images && Array.isArray(c.images) && c.images.length > 0,
        hasRanking: !!c.ranking,
        hasFees: !!c.hostelFees || !!c.averagePackage,
      })),
      collegesWithNewCourses: collegesWithNewCourses.map(c => ({
        collegeId: c.collegeId,
        collegeName: c.collegeName,
        coursesAdded: Number(c.coursesCount || 0),
      })),
      collegesWithNewReviews: collegesWithNewReviews.map(c => ({
        collegeId: c.collegeId,
        collegeName: c.collegeName,
        reviewsAdded: Number(c.reviewsCount || 0),
        averageRating: Number(c.avgRating || 0).toFixed(1),
      })),
    })
  } catch (error: any) {
    console.error("Error fetching enrichment results:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to fetch enrichment results" 
    }, { status: 500 })
  } finally {
    await client.end()
  }
}

