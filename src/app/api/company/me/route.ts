import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function sessionCookie(req: NextRequest) {
  const v = req.cookies.get("backend_session")?.value ?? "";
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export async function GET(req: NextRequest) {
  const session = sessionCookie(req);
  if (!session) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const upstream = await fetch(`${API_BASE_URL}/companies/me`, {
    headers: { Cookie: session, Accept: "application/json" },
    cache: "no-store",
  });

  const text = await upstream.text();
  try {
    return NextResponse.json(text ? JSON.parse(text) : null, { status: upstream.status });
  } catch {
    return NextResponse.json({ detail: text || "EMPTY" }, { status: upstream.status });
  }
}

export async function PATCH(req: NextRequest) {
  const session = sessionCookie(req);
  if (!session) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const body = await req.text();

  const upstream = await fetch(`${API_BASE_URL}/companies/me`, {
    method: "PATCH",
    headers: {
      Cookie: session,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  try {
    return NextResponse.json(text ? JSON.parse(text) : null, { status: upstream.status });
  } catch {
    return NextResponse.json({ detail: text || "EMPTY" }, { status: upstream.status });
  }
}