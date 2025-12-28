import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { counselingBookings, counselingPackages, counselors } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      packageId,
      counselorId,
      name,
      email,
      phone,
      preferredDate,
      preferredTime,
      notes,
    } = body

    if (!packageId || !name || !email) {
      return NextResponse.json(
        { error: "Package ID, name, and email are required" },
        { status: 400 }
      )
    }

    // Get package details
    const [packageData] = await db
      .select()
      .from(counselingPackages)
      .where(eq(counselingPackages.id, packageId))
      .limit(1)

    if (!packageData || !packageData.isActive) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    // Get user ID if logged in
    const session = await auth()
    const userId = session?.user?.id ? parseInt(session.user.id) : null

    // Create booking
    const [booking] = await db
      .insert(counselingBookings)
      .values({
        userId: userId || undefined,
        packageId,
        counselorId: counselorId || null,
        name,
        email,
        phone: phone || null,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime || null,
        notes: notes || null,
        status: "pending",
        paymentStatus: "pending",
        amount: packageData.price,
        currency: packageData.currency,
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          packageId: booking.packageId,
          amount: booking.amount,
          currency: booking.currency,
          status: booking.status,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = session.user?.id ? parseInt(session.user.id) : null
    const isAdmin = session.user?.role === "admin"

    if (isAdmin) {
      // Admin can see all bookings
      const allBookings = await db
        .select({
          booking: counselingBookings,
          package: counselingPackages,
          counselor: counselors,
        })
        .from(counselingBookings)
        .leftJoin(counselingPackages, eq(counselingBookings.packageId, counselingPackages.id))
        .leftJoin(counselors, eq(counselingBookings.counselorId, counselors.id))

      return NextResponse.json({ bookings: allBookings })
    } else if (userId) {
      // Users can see their own bookings
      const userBookings = await db
        .select({
          booking: counselingBookings,
          package: counselingPackages,
          counselor: counselors,
        })
        .from(counselingBookings)
        .leftJoin(counselingPackages, eq(counselingBookings.packageId, counselingPackages.id))
        .leftJoin(counselors, eq(counselingBookings.counselorId, counselors.id))
        .where(eq(counselingBookings.userId, userId))

      return NextResponse.json({ bookings: userBookings })
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  } catch (error: any) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}

