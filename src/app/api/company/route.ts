import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function buildAuthCookie(req: NextRequest) {
  let v = req.cookies.get("backend_session")?.value ?? "";
  if (!v) return "";

  // Next may already decode, but handle encoded values safely
  try {
    v = decodeURIComponent(v);
  } catch {
    // ignore
  }

  v = v.trim();

  // Strip wrapping quotes if present
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }

  // If they accidentally stored a full Set-Cookie string, take only first pair
  // e.g. "enginuity_auth=...; Path=/; HttpOnly"
  if (v.includes(";")) v = v.split(";")[0].trim();

  // If value is just the JWT, wrap it
  if (!v.includes("=")) {
    return `enginuity_auth=${v}`;
  }

  // If it's encoded "enginuity_auth%3D..." it will already be decoded above.
  // But if it’s some other key, still try to map it to enginuity_auth.
  const [k, ...rest] = v.split("=");
  const token = rest.join("=");
  if (!token) return "";

  if (k !== "enginuity_auth") {
    return `enginuity_auth=${token}`;
  }

  return `enginuity_auth=${token}`;
}

export async function POST(req: NextRequest) {
  const cookie = buildAuthCookie(req);
  if (!cookie) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const body = await req.text();

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