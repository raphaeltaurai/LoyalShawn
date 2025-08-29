import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { z } from "zod"

const purchaseSchema = z.object({
  itemName: z.string().min(1),
  amount: z.number().positive(),
  location: z.string().min(1),
  paymentMethod: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = purchaseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { itemName, amount, location, paymentMethod } = parsed.data

    // Get user and tenant info
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: { tenant: true },
    })

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 })
    }

    // Get the loyalty program to calculate points
    const program = await prisma.program.findFirst({
      where: { tenantId: user.tenantId },
    })

    if (!program) {
      return NextResponse.json({ ok: false, error: "Loyalty program not found" }, { status: 404 })
    }

    // Calculate points earned (2 points per dollar by default)
    const pointsEarned = Math.round(amount * program.pointsPerDollar)

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        amount,
        pointsEarned,
        location,
        paymentMethod,
      },
    })

    return NextResponse.json({
      ok: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        pointsEarned: transaction.pointsEarned,
        location: transaction.location,
        timestamp: transaction.timestamp,
      },
      message: `Purchase successful! You earned ${pointsEarned} points.`,
    })
  } catch (e) {
    console.error("Purchase error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
