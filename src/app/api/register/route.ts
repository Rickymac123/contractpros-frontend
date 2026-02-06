import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

    if (!body) {
      return NextResponse.json({ detail: "INVALID_JSON" }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ detail: "MISSING_FIELDS" }, { status: 400 });
    }

    // Ensure a default role if client didn't send one
    if (typeof body.role !== "string" || !body.role) {
      body.role = "company";
    }

    const upstream = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body), // ✅ forward everything (first_name, address, etc.)
    });

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { detail: `INTERNAL_REGISTER_ERROR: ${e?.message ?? String(e)}` },
      { status: 500 },
    );
  }
}