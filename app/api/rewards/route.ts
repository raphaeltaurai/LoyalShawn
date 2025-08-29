import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"
import { z } from "zod"

const createRewardSchema = z.object({
  tenantId: z.string(),
  name: z.string().min(1),
  description: z.string().min(1),
  pointsCost: z.number().positive(),
  category: z.string().min(1),
  isActive: z.boolean().default(true),
  usageLimit: z.number().optional(),
  expiryDate: z.string().optional() // ISO date string
})

const updateRewardSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  pointsCost: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  usageLimit: z.number().optional(),
  expiryDate: z.string().optional()
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
    const parsed = createRewardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { tenantId, ...rewardData } = parsed.data

    // Verify admin belongs to the tenant
    if (payload.tenantId !== tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized for this tenant" }, { status: 403 })
    }

    const reward = await prisma.reward.create({
      data: {
        ...rewardData,
        tenantId,
        expiryDate: rewardData.expiryDate ? new Date(rewardData.expiryDate) : null
      }
    })

    return NextResponse.json({ ok: true, reward })
  } catch (e) {
    console.error("Reward creation error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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
    const parsed = updateRewardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { id, ...updateData } = parsed.data

    // Get the reward to verify tenant access
    const existingReward = await prisma.reward.findUnique({
      where: { id }
    })

    if (!existingReward) {
      return NextResponse.json({ ok: false, error: "Reward not found" }, { status: 404 })
    }

    if (existingReward.tenantId !== payload.tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized for this tenant" }, { status: 403 })
    }

    const reward = await prisma.reward.update({
      where: { id },
      data: {
        ...updateData,
        expiryDate: updateData.expiryDate ? new Date(updateData.expiryDate) : undefined
      }
    })

    return NextResponse.json({ ok: true, reward })
  } catch (e) {
    console.error("Reward update error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyAuthToken(token)
    if (!payload) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")

    if (!tenantId) {
      return NextResponse.json({ ok: false, error: "Tenant ID required" }, { status: 400 })
    }

    // Verify user belongs to the tenant
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user || user.tenantId !== tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized for this tenant" }, { status: 403 })
    }

    const rewards = await prisma.reward.findMany({
      where: { 
        tenantId,
        isActive: true // Only show active rewards to customers
      },
      orderBy: { pointsCost: "asc" }
    })

    return NextResponse.json({ ok: true, rewards })
  } catch (e) {
    console.error("Reward retrieval error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyAuthToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const rewardId = searchParams.get("id")

    if (!rewardId) {
      return NextResponse.json({ ok: false, error: "Reward ID required" }, { status: 400 })
    }

    // Get the reward to verify tenant access
    const existingReward = await prisma.reward.findUnique({
      where: { id: rewardId }
    })

    if (!existingReward) {
      return NextResponse.json({ ok: false, error: "Reward not found" }, { status: 404 })
    }

    if (existingReward.tenantId !== payload.tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized for this tenant" }, { status: 403 })
    }

    await prisma.reward.delete({
      where: { id: rewardId }
    })

    return NextResponse.json({ ok: true, message: "Reward deleted successfully" })
  } catch (e) {
    console.error("Reward deletion error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
