import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getEnginuityAuthCookie(req: NextRequest) {
  // Your frontend stores the backend cookie-pair inside backend_session.
  // Example value: "enginuity_auth%3D<jwt>"
  const raw = req.cookies.get("backend_session")?.value || "";
  if (!raw) return "";

  // decode %3D -> =
  const decoded = decodeURIComponent(raw);

  // If it already includes the cookie name, use as-is.
  if (decoded.startsWith("enginuity_auth=")) return decoded;

  // Otherwise assume it’s just the token and wrap it.
  return `enginuity_auth=${decoded}`;
}

export async function POST(req: NextRequest) {
  const cookiePair = getEnginuityAuthCookie(req);
  if (!cookiePair) {
    return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}/professional/review-invites`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: cookiePair,
    },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text || "", {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}