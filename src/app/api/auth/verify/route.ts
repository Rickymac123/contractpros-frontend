// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

/**
 * Proxies verification to FastAPI Users:
 *   POST /auth/verify  { token: "..." }
 *
 * Supports:
 *  - GET  /api/auth/verify?token=...  (handy if your link points to API)
 *  - POST /api/auth/verify           (body: { token })
 */

async function forwardVerify(token: string) {
  const upstream = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ token }),
    cache: "no-store",
  });

  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token") ?? "";
    if (!token) {
      return NextResponse.json({ detail: "MISSING_TOKEN" }, { status: 400 });
    }
    return await forwardVerify(token);
  } catch (e: any) {
    return NextResponse.json(
      { detail: `INTERNAL_VERIFY_ERROR: ${e?.message ?? String(e)}` },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as { token?: string } | null;
    const token = body?.token ?? "";
    if (!token) {
      return NextResponse.json({ detail: "MISSING_TOKEN" }, { status: 400 });
    }
    return await forwardVerify(token);
  } catch (e: any) {
    return NextResponse.json(
      { detail: `INTERNAL_VERIFY_ERROR: ${e?.message ?? String(e)}` },
      { status: 500 },
    );
  }
}