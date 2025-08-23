import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // In real app, persist securely (e.g., write to DB or external log service)
    console.log("[API_AUDIT]", {
      ...body,
      receivedAt: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for") || "unknown",
      ua: request.headers.get("user-agent") || "",
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 })
  }
}


