import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function backendAuthCookieHeader(req: NextRequest): string {
  const raw = req.cookies.get("backend_session")?.value ?? "";
  if (!raw) return "";

  // backend_session is often URL-encoded: "enginuity_auth%3D<jwt>"
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {}

  // If decoded is already "enginuity_auth=<jwt>", pass it through
  if (decoded.startsWith("enginuity_auth=")) return decoded;

  // If decoded looks like a JWT, prefix it
  if (decoded.split(".").length === 3) return `enginuity_auth=${decoded}`;

  // Last attempt: fix encoded '=' then decode again
  const fixed = raw.replace(/%3D/g, "=");
  try {
    const d2 = decodeURIComponent(fixed);
    if (d2.startsWith("enginuity_auth=")) return d2;
  } catch {}

  return "";
}

export async function POST(req: NextRequest) {
  const cookie = backendAuthCookieHeader(req);
  if (!cookie) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const body = await req.text();

  // Frontend route: /api/company  -> Backend route: POST /companies/
  const upstream = await fetch(`${API_BASE_URL}/companies/`, {
    method: "POST",
    headers: {
      Cookie: cookie,
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