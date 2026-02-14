import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function backendCookie(req: NextRequest) {
  const raw = req.cookies.get("backend_session")?.value ?? "";
  return raw ? decodeURIComponent(raw) : "";
}

export async function POST(req: NextRequest) {
  const cookie = backendCookie(req);
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