import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("backend_session")?.value;
  if (!session) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const res = await fetch(`${API_BASE_URL}/profile/me`, {
    headers: { Cookie: session, Accept: "application/json" },
    cache: "no-store",
  });

  const text = await res.text();
  return NextResponse.json(text ? JSON.parse(text) : null, { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const session = req.cookies.get("backend_session")?.value;
  if (!session) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ detail: "INVALID_BODY" }, { status: 400 });
  }

  const res = await fetch(`${API_BASE_URL}/profile/me`, {
    method: "PATCH",
    headers: {
      Cookie: session,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  return NextResponse.json(text ? JSON.parse(text) : null, { status: res.status });
}