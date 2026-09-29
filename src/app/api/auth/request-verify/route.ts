import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.email !== "string" || !body.email.trim()) return NextResponse.json({ detail: "INVALID_EMAIL" }, { status: 400 });
    const response = await fetch(`${API_BASE_URL}/auth/request-verify-token`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: body.email.trim() }), signal: AbortSignal.timeout(15000) });
    return NextResponse.json({ ok: response.ok }, { status: response.ok ? 200 : 502 });
  } catch { return NextResponse.json({ ok: false }, { status: 502 }); }
}
