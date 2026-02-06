import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as { email?: string } | null;
    const email = body?.email ?? "";
    if (!email) return NextResponse.json({ detail: "MISSING_EMAIL" }, { status: 400 });

    const upstream = await fetch(`${API_BASE_URL}/auth/request-verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email }),
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { detail: `INTERNAL_REQUEST_VERIFY_ERROR: ${e?.message ?? String(e)}` },
      { status: 500 },
    );
  }
}