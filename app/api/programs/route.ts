import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"
import { z } from "zod"

const updateProgramSchema = z.object({
  tenantId: z.string(),
  pointsPerDollar: z.number().positive(),
  birthdayBonus: z.number().nonnegative(),
  checkInBonusPoints: z.number().nonnegative(),
  checkInRadiusMeters: z.number().positive()
})

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

    let program = await prisma.program.findFirst({
      where: { tenantId }
    })

    // Create default program if none exists
    if (!program) {
      program = await prisma.program.create({
        data: {
          tenantId,
          name: "Default Loyalty Program",
          pointsPerDollar: 2,
          birthdayBonus: 250,
          checkInBonusPoints: 50,
          checkInRadiusMeters: 150
        }
      })
    }

    return NextResponse.json({ ok: true, program })
  } catch (e) {
    console.error("Program retrieval error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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
    const parsed = updateProgramSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { tenantId, ...programData } = parsed.data

    // Verify admin belongs to the tenant
    if (payload.tenantId !== tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized for this tenant" }, { status: 403 })
    }

    let program = await prisma.program.findFirst({
      where: { tenantId }
    })

    if (program) {
      // Update existing program
      program = await prisma.program.update({
        where: { id: program.id },
        data: programData
      })
    } else {
      // Create new program
      program = await prisma.program.create({
        data: {
          tenantId,
          name: "Default Loyalty Program",
          ...programData
        }
      })
    }

    return NextResponse.json({ ok: true, program })
  } catch (e) {
    console.error("Program update error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
