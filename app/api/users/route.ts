import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.role !== "admin") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId") || auth.tenantId
    const where = tenantId ? { tenantId } : {}
    const users = await prisma.user.findMany({ where, select: { id: true, email: true, name: true, role: true, tenantId: true } })
    return NextResponse.json({ ok: true, users })
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}


