import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getBackendAuthCookie(req: NextRequest) {
  const raw = req.cookies.get("backend_session")?.value || "";
  if (!raw) return "";

  const decoded = decodeURIComponent(raw);
  if (decoded.startsWith("enginuity_auth=")) return decoded;

  return `enginuity_auth=${decoded}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const cookiePair = getBackendAuthCookie(req);
  if (!cookiePair) {
    return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { requestId } = await params;

  const res = await fetch(`${API_BASE_URL}/professional/booking-requests/${requestId}/accept`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: cookiePair,
    },
    cache: "no-store",
  });

  const text = await res.text();

  return new NextResponse(text || "", {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}