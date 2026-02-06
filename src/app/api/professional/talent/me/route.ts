import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getBackendCookie(req: NextRequest) {
  // Your app stores the backend cookie value in "backend_session"
  // which should contain something like: "enginuity_auth=...."
  return req.cookies.get("backend_session")?.value ?? "";
}

export async function GET(req: NextRequest) {
  const session = getBackendCookie(req);
  if (!session) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const res = await fetch(`${API_BASE_URL}/professional/talent/me`, {
    headers: { Cookie: session, Accept: "application/json" },
    cache: "no-store",
  });

  const text = await res.text();
  return NextResponse.json(text ? JSON.parse(text) : null, { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const session = getBackendCookie(req);
  if (!session) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const body = await req.text();

  const res = await fetch(`${API_BASE_URL}/professional/talent/me`, {
    method: "PATCH",
    headers: {
      Cookie: session,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  return NextResponse.json(text ? JSON.parse(text) : null, { status: res.status });
}