import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getAuthCookieHeader(req: NextRequest): string | null {
  const raw = req.cookies.get("backend_session")?.value;
  if (!raw) return null;

  // backend_session often stores URL-encoded "enginuity_auth=<jwt>"
  const decoded = decodeURIComponent(raw);

  // If it already contains the cookie pair, pass it through.
  if (decoded.startsWith("enginuity_auth=")) return decoded;

  // Otherwise assume it's the jwt itself.
  return `enginuity_auth=${decoded}`;
}

export async function POST(req: NextRequest) {
  const cookiePair = getAuthCookieHeader(req);
  if (!cookiePair) {
    return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const body = await req.text();

  const upstream = await fetch(`${API_BASE_URL}/companies/`, {
    method: "POST",
    headers: {
      Cookie: cookiePair,
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