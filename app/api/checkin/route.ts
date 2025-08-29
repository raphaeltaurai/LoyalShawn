import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"
import { z } from "zod"

const checkInSchema = z.object({
  tenantId: z.string(),
  latitude: z.number(),
  longitude: z.number()
})

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyAuthToken(token)
    if (!payload) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = checkInSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { tenantId, latitude, longitude } = parsed.data

    // Verify user belongs to the tenant
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user || user.tenantId !== tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized for this tenant" }, { status: 403 })
    }

    // Get geofences for the tenant
    const geofences = await prisma.geofence.findMany({
      where: { tenantId }
    })

    if (geofences.length === 0) {
      return NextResponse.json({ ok: false, error: "No locations configured" }, { status: 400 })
    }

    // Get program settings
    const program = await prisma.program.findFirst({
      where: { tenantId }
    })

    if (!program) {
      return NextResponse.json({ ok: false, error: "Loyalty program not found" }, { status: 404 })
    }

    // Check if user is within any geofence
    const isWithinGeofence = geofences.some(fence => {
      const distance = calculateDistance(
        latitude,
        longitude,
        fence.latitude,
        fence.longitude
      )
      return distance <= fence.radiusMeters
    })

    if (!isWithinGeofence) {
      return NextResponse.json({ ok: false, error: "You are not at a participating location" }, { status: 400 })
    }

    // Check if user has already checked in recently (within 24 hours)
    const recentCheckIn = await prisma.transaction.findFirst({
      where: {
        userId: payload.userId,
        location: "Check-in Bonus",
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
        }
      }
    })

    if (recentCheckIn) {
      return NextResponse.json({ ok: false, error: "You have already checked in today" }, { status: 400 })
    }

    // Award check-in bonus
    const bonusPoints = program.checkInBonusPoints || 50

    await prisma.transaction.create({
      data: {
        userId: payload.userId,
        tenantId,
        amount: 0,
        pointsEarned: bonusPoints,
        pointsRedeemed: 0,
        location: "Check-in Bonus",
        paymentMethod: "Location Check-in"
      }
    })

    return NextResponse.json({ 
      ok: true, 
      message: `Check-in successful! You earned ${bonusPoints} bonus points.` 
    })
  } catch (e) {
    console.error("Check-in error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
