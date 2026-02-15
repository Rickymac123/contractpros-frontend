import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function backendCookie(req: NextRequest) {
  const raw = req.cookies.get("backend_session")?.value ?? "";
  // backend_session stores "enginuity_auth=..." but may arrive URL-encoded as "enginuity_auth%3D..."
  return raw ? decodeURIComponent(raw) : "";
}

export async function POST(req: NextRequest) {
  const session = backendCookie(req);
  if (!session) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const body = await req.text();

  // Backend route is /companies/
  const upstream = await fetch(`${API_BASE_URL}/companies/`, {
    method: "POST",
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