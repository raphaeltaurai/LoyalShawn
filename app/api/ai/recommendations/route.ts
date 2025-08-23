import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { recommendOffers } from "@/lib/ai"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ ok: false, error: "userId required" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 })

  const txns = await prisma.transaction.findMany({ where: { userId } })
  const spend = txns.reduce((s, t) => s + t.amount, 0)
  const visits = txns.length
  const last = txns.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
  const recencyDays = last ? Math.floor((Date.now() - last.timestamp.getTime()) / (1000 * 60 * 60 * 24)) : 999

  const offers = recommendOffers([spend, visits, recencyDays])
  return NextResponse.json({ ok: true, offers })
}


