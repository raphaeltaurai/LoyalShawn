import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { signAuthToken } from "@/lib/auth"

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 400 })
    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 })

    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role as any, tenantId: user.tenantId })
    return NextResponse.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenantId, picture: user.picture } })
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}


