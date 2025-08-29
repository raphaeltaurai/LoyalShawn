import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"
import { z } from "zod"

const verifyPurchaseSchema = z.object({
  purchaseId: z.string(),
  action: z.enum(["approve", "decline"])
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
    const parsed = verifyPurchaseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { purchaseId, action } = parsed.data

    // Get the purchase
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        user: true,
        tenant: true
      }
    })

    if (!purchase) {
      return NextResponse.json({ ok: false, error: "Purchase not found" }, { status: 404 })
    }

    // Verify admin belongs to the same tenant
    if (purchase.tenantId !== payload.tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized for this tenant" }, { status: 403 })
    }

    if (purchase.status !== "pending") {
      return NextResponse.json({ ok: false, error: "Purchase already processed" }, { status: 400 })
    }

    if (action === "approve") {
      // Get the loyalty program to calculate points
      const program = await prisma.program.findFirst({
        where: { tenantId: purchase.tenantId }
      })

      if (!program) {
        return NextResponse.json({ ok: false, error: "Loyalty program not found" }, { status: 404 })
      }

      // Calculate points earned
      const pointsEarned = Math.round(purchase.amount * program.pointsPerDollar)

      // Update purchase status and award points
      await prisma.$transaction([
        // Update purchase
        prisma.purchase.update({
          where: { id: purchaseId },
          data: {
            status: "approved",
            approvedBy: payload.userId,
            approvedAt: new Date(),
            pointsAwarded: pointsEarned
          }
        }),
        // Create transaction record
        prisma.transaction.create({
          data: {
            userId: purchase.userId,
            tenantId: purchase.tenantId,
            amount: purchase.amount,
            pointsEarned,
            location: purchase.location,
            paymentMethod: "Verified Purchase"
          }
        })
      ])

      return NextResponse.json({ 
        ok: true, 
        message: `Purchase approved! Customer awarded ${pointsEarned} points.` 
      })
    } else {
      // Decline purchase
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          status: "declined",
          approvedBy: payload.userId,
          approvedAt: new Date()
        }
      })

      return NextResponse.json({ 
        ok: true, 
        message: "Purchase declined." 
      })
    }
  } catch (e) {
    console.error("Purchase verification error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
