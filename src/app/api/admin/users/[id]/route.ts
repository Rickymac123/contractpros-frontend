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
  // e.g. /api/admin/users/1
  const parts = req.nextUrl.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  return last && last !== "undefined" ? last : null;
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const cookieHeader = getCookieHeader(req);
  if (!cookieHeader) {
    return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;
  const resolvedId = id ?? getIdFromPath(req);
  if (!resolvedId) {
    return NextResponse.json({ detail: "MISSING_ID_PARAM" }, { status: 400 });
  }

  const upstream = await fetch(`${API_BASE_URL}/admin/users/${resolvedId}`, {
    headers: {
      Cookie: cookieHeader,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
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

  const upstream = await fetch(`${API_BASE_URL}/admin/users/${resolvedId}`, {
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

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const cookieHeader = getCookieHeader(req);
  if (!cookieHeader) {
    return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;
  const resolvedId = id ?? getIdFromPath(req);
  if (!resolvedId) {
    return NextResponse.json({ detail: "MISSING_ID_PARAM" }, { status: 400 });
  }

  const upstream = await fetch(`${API_BASE_URL}/admin/users/${resolvedId}`, {
    method: "DELETE",
    headers: {
      Cookie: cookieHeader,
      Accept: "application/json",
    },
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
