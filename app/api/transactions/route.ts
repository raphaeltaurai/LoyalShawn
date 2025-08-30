import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { getAuthFromRequest } from "@/lib/auth"

const txnSchema = z.object({
  userId: z.string().min(1),
  tenantId: z.string().min(1),
  amount: z.number().positive(),
  location: z.string().min(1),
  paymentMethod: z.string().min(1),
})

export async function GET(request: Request) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")
    const userId = searchParams.get("userId")

    if (!tenantId) {
      return NextResponse.json({ ok: false, error: "Tenant ID required" }, { status: 400 })
    }

    // Build where clause
    const where: any = { tenantId }
    if (userId && auth.role === "customer") {
      // Customers can only see their own transactions
      where.userId = userId
    } else if (userId && auth.role === "admin") {
      // Admins can filter by specific user or see all
      where.userId = userId
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        amount: true,
        pointsEarned: true,
        pointsRedeemed: true,
        location: true,
        timestamp: true,
        paymentMethod: true,
        userId: true,
      }
    })

    return NextResponse.json({ ok: true, transactions })
  } catch (e) {
    console.error("Transactions fetch error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    const body = await request.json()
    const parsed = txnSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })

    const { userId, tenantId, amount, location, paymentMethod } = parsed.data
    if (auth.role !== "admin" && auth.userId !== userId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
    }
    if (auth.tenantId !== tenantId) {
      return NextResponse.json({ ok: false, error: "Tenant mismatch" }, { status: 400 })
    }

    // Simple points policy: 2 points per dollar
    const pointsEarned = Math.round(amount * 2)

    const txn = await prisma.transaction.create({
      data: { userId, tenantId, amount, pointsEarned, location, paymentMethod },
    })

    return NextResponse.json({ ok: true, transaction: txn })
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}


