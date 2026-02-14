import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function backendAuthCookieHeader(req: NextRequest): string {
  const raw = req.cookies.get("backend_session")?.value ?? "";
  if (!raw) return "";

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {}

  if (decoded.startsWith("enginuity_auth=")) return decoded;

  if (decoded.split(".").length === 3) return `enginuity_auth=${decoded}`;

  const fixed = raw.replace(/%3D/g, "=");
  try {
    const d2 = decodeURIComponent(fixed);
    if (d2.startsWith("enginuity_auth=")) return d2;
  } catch {}

  return "";
}

export async function GET(req: NextRequest) {
  const cookie = backendAuthCookieHeader(req);
  if (!cookie) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  // Frontend route: /api/company/me  -> Backend route: GET /companies/me
  const upstream = await fetch(`${API_BASE_URL}/companies/me`, {
    headers: { Cookie: cookie, Accept: "application/json" },
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
  const cookie = backendAuthCookieHeader(req);
  if (!cookie) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const body = await req.text();

  // Frontend route: /api/company/me  -> Backend route: PATCH /companies/me
  const upstream = await fetch(`${API_BASE_URL}/companies/me`, {
    method: "PATCH",
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