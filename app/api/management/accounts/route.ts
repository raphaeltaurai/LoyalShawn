import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"
import { z } from "zod"

const promoteUserSchema = z.object({
  userId: z.string(),
  newRole: z.enum(["admin", "customer"])
})

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyAuthToken(token)
    if (!payload || payload.role !== "management") {
      return NextResponse.json({ ok: false, error: "Management access required" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: {
        role: { not: "management" } // Exclude management accounts
      },
      include: {
        tenant: true
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ ok: true, users })
  } catch (e) {
    console.error("Account management error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyAuthToken(token)
    if (!payload || payload.role !== "management") {
      return NextResponse.json({ ok: false, error: "Management access required" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = promoteUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { userId, newRole } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 })
    }

    if (user.role === "management") {
      return NextResponse.json({ ok: false, error: "Cannot modify management accounts" }, { status: 403 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    })

    return NextResponse.json({ 
      ok: true, 
      message: `User role updated to ${newRole}`,
      user: updatedUser
    })
  } catch (e) {
    console.error("User promotion error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
