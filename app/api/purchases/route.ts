import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"
import { z } from "zod"

const createPurchaseSchema = z.object({
  tenantId: z.string(),
  location: z.string(),
  amount: z.number().positive(),
  items: z.array(z.object({
    name: z.string(),
    category: z.string(),
    price: z.number().positive(),
    quantity: z.number().positive()
  }))
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
    const parsed = createPurchaseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { tenantId, location, amount, items } = parsed.data

    // Verify user belongs to the tenant
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user || user.tenantId !== tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized for this tenant" }, { status: 403 })
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId: payload.userId,
        tenantId,
        location,
        amount,
        items: JSON.stringify(items),
        status: "pending"
      }
    })

    return NextResponse.json({ ok: true, purchase })
  } catch (e) {
    console.error("Purchase creation error:", e)
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
    const status = searchParams.get("status")

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

    const where: any = { tenantId }
    if (status) {
      where.status = status
    }

    // If user is customer, only show their purchases
    if (payload.role === "customer") {
      where.userId = payload.userId
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { timestamp: "desc" }
    })

    return NextResponse.json({ ok: true, purchases })
  } catch (e) {
    console.error("Purchase retrieval error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
