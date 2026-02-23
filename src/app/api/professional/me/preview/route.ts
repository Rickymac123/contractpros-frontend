import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getBackendSessionCookie(req: NextRequest) {
  return req.cookies.get("backend_session")?.value || "";
}

export async function GET(req: NextRequest) {
  const cookiePair = getBackendSessionCookie(req);
  if (!cookiePair) return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });

  const res = await fetch(`${API_BASE_URL}/professional/me/preview`, {
    headers: { Accept: "application/json", Cookie: cookiePair },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text || "", {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}