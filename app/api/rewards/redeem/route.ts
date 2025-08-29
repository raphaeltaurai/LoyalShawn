import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"
import { z } from "zod"

const redeemSchema = z.object({
  rewardId: z.string(),
  tenantId: z.string()
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
    const parsed = redeemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { rewardId, tenantId } = parsed.data

    // Verify user belongs to the tenant
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user || user.tenantId !== tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized for this tenant" }, { status: 403 })
    }

    // Get the reward
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId }
    })

    if (!reward || reward.tenantId !== tenantId) {
      return NextResponse.json({ ok: false, error: "Reward not found" }, { status: 404 })
    }

    if (!reward.isActive) {
      return NextResponse.json({ ok: false, error: "This reward is no longer available" }, { status: 400 })
    }

    if (reward.expiryDate && new Date() > reward.expiryDate) {
      return NextResponse.json({ ok: false, error: "This reward has expired" }, { status: 400 })
    }

    if (reward.usageLimit && reward.usageCount >= reward.usageLimit) {
      return NextResponse.json({ ok: false, error: "This reward has reached its usage limit" }, { status: 400 })
    }

    // Calculate user's current points
    const transactions = await prisma.transaction.findMany({
      where: { userId: payload.userId }
    })

    const totalEarned = transactions.reduce((sum, t) => sum + t.pointsEarned, 0)
    const totalRedeemed = transactions.reduce((sum, t) => sum + t.pointsRedeemed, 0)
    const currentPoints = totalEarned - totalRedeemed

    if (currentPoints < reward.pointsCost) {
      return NextResponse.json({ 
        ok: false, 
        error: `Insufficient points. You need ${reward.pointsCost - currentPoints} more points.` 
      }, { status: 400 })
    }

    // Process redemption
    await prisma.$transaction([
      // Update reward usage count
      prisma.reward.update({
        where: { id: rewardId },
        data: { usageCount: reward.usageCount + 1 }
      }),
      // Create redemption transaction
      prisma.transaction.create({
        data: {
          userId: payload.userId,
          tenantId,
          amount: 0,
          pointsEarned: 0,
          pointsRedeemed: reward.pointsCost,
          location: "Reward Redemption",
          paymentMethod: "Points"
        }
      })
    ])

    return NextResponse.json({ 
      ok: true, 
      message: `Successfully redeemed ${reward.name}!` 
    })
  } catch (e) {
    console.error("Reward redemption error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
