import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getBackendAuthCookie(req: NextRequest) {
  const raw = req.cookies.get("backend_session")?.value || "";
  if (!raw) return "";

  const decoded = decodeURIComponent(raw);
  if (decoded.startsWith("enginuity_auth=")) return decoded;

  return `enginuity_auth=${decoded}`;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const cookiePair = getBackendAuthCookie(req);
  if (!cookiePair) {
    return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { applicationId } = await params;
  const body = await req.text();

  const res = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: cookiePair,
    },
    body,
    cache: "no-store",import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getBackendAuthCookie(req: NextRequest) {
  const raw = req.cookies.get("backend_session")?.value || "";
  if (!raw) return "";

  const decoded = decodeURIComponent(raw);
  if (decoded.startsWith("enginuity_auth=")) return decoded;

  return `enginuity_auth=${decoded}`;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  try {
    const cookiePair = getBackendAuthCookie(req);
    if (!cookiePair) {
      return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { applicationId } = await params;
    const body = await req.text();

    const res = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookiePair,
      },
      body,
      cache: "no-store",
    });

    const text = await res.text();

    return new NextResponse(text || "", {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    return new NextResponse(
      error instanceof Error ? error.message : "FAILED_TO_PROXY_APPLICATION_PATCH",
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }
}
  });

  const text = await res.text();

  return new NextResponse(text || "", {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}