import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getEnginuityCookie(req: NextRequest): string {
  const raw = req.cookies.get("backend_session")?.value ?? "";
  if (!raw) return "";

  // Try to decode URL encoding
  let v = raw;
  try { v = decodeURIComponent(raw); } catch {}

  // Keep only first token if anything weird got stored
  v = v.split(";")[0]?.trim() ?? "";

  // Cases:
  // 1) "enginuity_auth=<jwt>"
  if (v.startsWith("enginuity_auth=")) return v;

  // 2) "<jwt>" (3 dot-separated segments)
  if (v.split(".").length === 3) return `enginuity_auth=${v}`;

  // 3) "enginuity_auth%3D<jwt>" still not decoded for some reason
  if (v.startsWith("enginuity_auth%3D")) {
    const maybe = v.replace("enginuity_auth%3D", "enginuity_auth=");
    return maybe.split(";")[0]?.trim() ?? "";
  }

  return "";
}

export async function POST(req: NextRequest) {
  const cookie = getEnginuityCookie(req);
  if (!cookie) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const body = await req.text();

  const upstream = await fetch(`${API_BASE_URL}/companies/`, {
    method: "POST",
    headers: {
      cookie, // send ONLY enginuity_auth=<jwt>
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