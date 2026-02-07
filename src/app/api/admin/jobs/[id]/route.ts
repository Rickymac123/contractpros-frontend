import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

type Ctx = { params: Promise<{ id: string }> };

function getCookieHeader(req: NextRequest) {
  const session = req.cookies.get("backend_session")?.value;
  if (!session) return null;
  // stored as "cookieName=cookieValue"
  return session;
}

function getIdFromPath(req: NextRequest) {
  // e.g. /api/admin/jobs/123
  const parts = req.nextUrl.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  return last && last !== "undefined" ? last : null;
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const cookieHeader = getCookieHeader(req);
  if (!cookieHeader) {
    return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;
  const resolvedId = id ?? getIdFromPath(req);
  if (!resolvedId) {
    return NextResponse.json({ detail: "MISSING_ID_PARAM" }, { status: 400 });
  }

  const body = await req.text();

  const upstream = await fetch(`${API_BASE_URL}/admin/jobs/${resolvedId}`, {
    method: "PATCH",
    headers: {
      Cookie: cookieHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}