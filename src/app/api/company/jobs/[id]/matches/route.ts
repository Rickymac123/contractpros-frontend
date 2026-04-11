import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getBackendAuthCookie(req: NextRequest) {
  const raw = req.cookies.get("backend_session")?.value || "";
  if (!raw) return "";

  const decoded = decodeURIComponent(raw);
  if (decoded.startsWith("enginuity_auth=")) return decoded;

  return `enginuity_auth=${decoded}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookiePair = getBackendAuthCookie(req);
    if (!cookiePair) {
      return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { id } = await params;

    const res = await fetch(`${API_BASE_URL}/company/jobs/${id}/matches`, {
      method: "GET",
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
  } catch (error) {
    return new NextResponse(
      error instanceof Error ? `${error.name}: ${error.message}` : "FAILED_TO_LOAD_JOB_MATCHES",
      {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      },
    );
  }
}