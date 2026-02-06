import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getSessionCookie(req: NextRequest) {
  return req.cookies.get("backend_session")?.value ?? null;
}

export async function GET(req: NextRequest) {
  const session = getSessionCookie(req);
  if (!session) {
    return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const upstream = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Cookie: session,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await upstream.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}

  if (!upstream.ok) {
    return NextResponse.json(
      json ?? { detail: `ME_STATUS_${upstream.status}: ${text || "EMPTY"}` },
      { status: upstream.status },
    );
  }

  return NextResponse.json(json ?? {}, { status: 200 });
}