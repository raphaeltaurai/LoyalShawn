import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthFromRequest } from "@/lib/auth"
import { z } from "zod"

const promoteSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "customer"]),
})

export async function POST(request: Request) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = promoteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { userId, role } = parsed.data

    // Verify the user exists and belongs to the same tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId: auth.tenantId },
    })

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 })
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    })

    return NextResponse.json({ 
      ok: true, 
      user: { 
        id: updatedUser.id, 
        email: updatedUser.email, 
        name: updatedUser.name, 
        role: updatedUser.role 
      } 
    })
  } catch (e) {
    console.error("Promote user error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
