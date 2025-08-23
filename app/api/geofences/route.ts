import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get("tenantId")
  if (!tenantId) return NextResponse.json({ ok: false, error: "tenantId required" }, { status: 400 })
  const fences = await prisma.geofence.findMany({ where: { tenantId } })
  return NextResponse.json({ ok: true, geofences: fences })
}


