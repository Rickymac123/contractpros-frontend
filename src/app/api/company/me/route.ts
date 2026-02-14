import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function backendCookieHeader(req: NextRequest) {
  const raw = req.cookies.get("backend_session")?.value ?? "";
  if (!raw) return "";

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function GET(req: NextRequest) {
  const cookieHeader = backendCookieHeader(req);
  if (!cookieHeader) {
    return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const upstream = await fetch(`${API_BASE_URL}/companies/me`, {
    headers: { Cookie: cookieHeader, Accept: "application/json" },
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
  const cookieHeader = backendCookieHeader(req);
  if (!cookieHeader) {
    return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const body = await req.text();

  const upstream = await fetch(`${API_BASE_URL}/companies/me`, {
    method: "PATCH",
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