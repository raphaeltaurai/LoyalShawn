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


