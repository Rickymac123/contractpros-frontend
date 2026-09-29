import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ detail: "INVALID_JSON" }, { status: 400 });
    if (!["professional", "company", "agency"].includes(body.role)) return NextResponse.json({ detail: "INVALID_ROLE" }, { status: 400 });
    if (["is_superuser", "is_active", "is_verified"].some(key => key in body)) return NextResponse.json({ detail: "INVALID_PERMISSIONS" }, { status: 400 });
    if (typeof body.email !== "string" || typeof body.password !== "string") return NextResponse.json({ detail: "MISSING_FIELDS" }, { status: 400 });
    body.email = body.email.trim();
    const upstream = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
    });
    if (upstream.status >= 500) return NextResponse.json({ detail: "REGISTER_UNAVAILABLE" }, { status: 502 });
    return new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ detail: "REGISTER_UNAVAILABLE" }, { status: 502 });
  }
}
