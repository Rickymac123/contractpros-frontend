import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getBackendSessionCookie(req: NextRequest) {
  const v = req.cookies.get("backend_session")?.value || "";
  // backend_session stores "enginuity_auth=...."
  return v;
}

export async function GET(req: NextRequest) {
  const cookiePair = getBackendSessionCookie(req);
  if (!cookiePair) return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });

  const res = await fetch(`${API_BASE_URL}/professional/availability`, {
    method: "GET",
    headers: { Accept: "application/json", Cookie: cookiePair },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text || "", {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const cookiePair = getBackendSessionCookie(req);
  if (!cookiePair) return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });

  const body = await req.text();

  const res = await fetch(`${API_BASE_URL}/professional/availability`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: cookiePair,
    },
    body,
  });

  const text = await res.text();
  return new NextResponse(text || "", {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}