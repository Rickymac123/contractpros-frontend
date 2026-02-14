import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function backendCookieHeader(req: NextRequest) {
  const raw = req.cookies.get("backend_session")?.value ?? "";
  if (!raw) return "";

  // backend_session stores something like: "enginuity_auth%3D<jwt>"
  // Decode to: "enginuity_auth=<jwt>"
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function POST(req: NextRequest) {
  const cookieHeader = backendCookieHeader(req);
  if (!cookieHeader) {
    return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const body = await req.text();

  const upstream = await fetch(`${API_BASE_URL}/companies/`, {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
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