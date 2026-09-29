import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getBackendSessionCookie(req: NextRequest) {
  return req.cookies.get("backend_session")?.value || "";
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const cookiePair = getBackendSessionCookie(req);
  if (!cookiePair) return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await ctx.params; // <-- unwrap params
  const body = await req.text();

  const res = await fetch(`${API_BASE_URL}/professional/availability/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: cookiePair,
    },
    body,
  });

  const text = await res.text();
  return new NextResponse(text || "", {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const cookiePair = getBackendSessionCookie(req);
  if (!cookiePair) return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await ctx.params; // <-- unwrap params

  const res = await fetch(`${API_BASE_URL}/professional/availability/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json", Cookie: cookiePair },
  });

  if (res.status === 204) return new NextResponse(null, { status: 204 });

  const text = await res.text();
  return new NextResponse(text || "", {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}