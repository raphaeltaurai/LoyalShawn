import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30" // days

    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(period))

    // Get all data for the tenant
    const [users, transactions, rewards] = await Promise.all([
      prisma.user.findMany({
        where: { tenantId: auth.tenantId },
        select: { id: true, role: true, createdAt: true },
      }),
      prisma.transaction.findMany({
        where: { 
          tenantId: auth.tenantId,
          timestamp: { gte: daysAgo }
        },
        select: { 
          amount: true, 
          pointsEarned: true, 
          pointsRedeemed: true, 
          timestamp: true,
          location: true,
          userId: true
        },
      }),
      prisma.reward.findMany({
        where: { tenantId: auth.tenantId },
        select: { id: true, usageCount: true, pointsCost: true },
      }),
    ])

    // Calculate analytics
    const totalCustomers = users.filter(u => u.role === "customer").length
    const totalAdmins = users.filter(u => u.role === "admin").length
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)
    const totalPointsIssued = transactions.reduce((sum, t) => sum + t.pointsEarned, 0)
    const totalPointsRedeemed = transactions.reduce((sum, t) => sum + t.pointsRedeemed, 0)
    const avgTransactionValue = transactions.length > 0 ? totalRevenue / transactions.length : 0

    // Daily activity for the last 30 days
    const dailyActivity = []
    for (let i = 0; i < parseInt(period); i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      const dayTransactions = transactions.filter(t => 
        t.timestamp >= dayStart && t.timestamp <= dayEnd
      )

      dailyActivity.unshift({
        date: dayStart.toISOString().split('T')[0],
        transactions: dayTransactions.length,
        revenue: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
        pointsIssued: dayTransactions.reduce((sum, t) => sum + t.pointsEarned, 0),
      })
    }

    // Location breakdown
    const locationStats = transactions.reduce((acc, t) => {
      acc[t.location] = (acc[t.location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Top customers by points
    const customerPoints = transactions.reduce((acc, t) => {
      acc[t.userId] = (acc[t.userId] || 0) + t.pointsEarned
      return acc
    }, {} as Record<string, number>)

    const topCustomers = Object.entries(customerPoints)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([userId, points]) => ({ userId, points }))

    return NextResponse.json({
      ok: true,
      analytics: {
        overview: {
          totalCustomers,
          totalAdmins,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalPointsIssued,
          totalPointsRedeemed,
          avgTransactionValue: Math.round(avgTransactionValue * 100) / 100,
          activePeriod: `${period} days`,
        },
        dailyActivity,
        locationStats,
        topCustomers,
        rewards: {
          totalRewards: rewards.length,
          totalUsage: rewards.reduce((sum, r) => sum + r.usageCount, 0),
        },
      },
    })
  } catch (e) {
    console.error("Analytics error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
