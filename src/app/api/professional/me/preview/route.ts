import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getBackendAuthCookiePair(req: NextRequest) {
  // Stored on the frontend domain as URL-encoded "enginuity_auth=<jwt>"
  const raw = req.cookies.get("backend_session")?.value || "";
  if (!raw) return "";

  const decoded = decodeURIComponent(raw);

  // If it's already "enginuity_auth=...", use it
  if (decoded.startsWith("enginuity_auth=")) return decoded;

  // If someone stored just the token value, wrap it
  return `enginuity_auth=${decoded}`;
}

export async function GET(req: NextRequest) {
  const cookiePair = getBackendAuthCookiePair(req);
  if (!cookiePair) {
    return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}/professional/me/preview`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookiePair, // must be "enginuity_auth=<jwt>"
    },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text || "", {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}