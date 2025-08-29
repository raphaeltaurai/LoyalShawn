import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      where: { id: params.id }
    })

    if (!user || user.tenantId !== tenantId) {
      return NextResponse.json({ ok: false, error: "User not found or unauthorized" }, { status: 404 })
    }

    // Calculate points from transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: params.id }
    })

    const totalEarned = transactions.reduce((sum, t) => sum + t.pointsEarned, 0)
    const totalRedeemed = transactions.reduce((sum, t) => sum + t.pointsRedeemed, 0)
    const points = totalEarned - totalRedeemed

    // Calculate total spent
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)

    // Calculate visit count (unique days with transactions)
    const uniqueDays = new Set(
      transactions.map(t => new Date(t.timestamp).toDateString())
    ).size

    // Get last visit
    const lastTransaction = transactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0]

    // Determine tier based on points
    let tier = "bronze"
    if (points >= 2000) tier = "platinum"
    else if (points >= 1000) tier = "gold"
    else if (points >= 500) tier = "silver"

    const customerData = {
      id: user.id,
      name: user.name,
      email: user.email,
      points,
      totalSpent,
      visitCount: uniqueDays,
      joinDate: user.createdAt.toISOString(),
      lastVisit: lastTransaction?.timestamp || user.createdAt.toISOString(),
      tier
    }

    return NextResponse.json({ ok: true, customer: customerData })
  } catch (e) {
    console.error("User data retrieval error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
