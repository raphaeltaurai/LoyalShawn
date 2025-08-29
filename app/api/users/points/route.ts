import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"
import { z } from "zod"

const updatePointsSchema = z.object({
  userId: z.string(),
  pointsAdjustment: z.number(),
  reason: z.string().min(1)
})

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyAuthToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updatePointsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { userId, pointsAdjustment, reason } = parsed.data

    // Get the user to verify tenant access
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 })
    }

    if (user.tenantId !== payload.tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized for this tenant" }, { status: 403 })
    }

    // Calculate new points balance
    const currentPoints = await calculateUserPoints(userId)
    const newPoints = Math.max(0, currentPoints + pointsAdjustment)

    // Create a transaction record for the points adjustment
    await prisma.transaction.create({
      data: {
        userId,
        tenantId: user.tenantId,
        amount: 0,
        pointsEarned: pointsAdjustment > 0 ? pointsAdjustment : 0,
        pointsRedeemed: pointsAdjustment < 0 ? Math.abs(pointsAdjustment) : 0,
        location: "Admin Adjustment",
        paymentMethod: "Manual Adjustment",
      }
    })

    return NextResponse.json({ 
      ok: true, 
      message: `Points adjusted successfully. New balance: ${newPoints}`,
      newBalance: newPoints
    })
  } catch (e) {
    console.error("Points adjustment error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}

// Helper function to calculate user's current points balance
async function calculateUserPoints(userId: string): Promise<number> {
  const transactions = await prisma.transaction.findMany({
    where: { userId }
  })

  const totalEarned = transactions.reduce((sum, t) => sum + t.pointsEarned, 0)
  const totalRedeemed = transactions.reduce((sum, t) => sum + t.pointsRedeemed, 0)
  
  return totalEarned - totalRedeemed
}
