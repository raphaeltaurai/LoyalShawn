import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) return NextResponse.json({ ok: false, error: "Missing credentials" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 })

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenantId, picture: user.picture } })
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}


