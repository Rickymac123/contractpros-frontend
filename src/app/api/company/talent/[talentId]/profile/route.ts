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
  { params }: { params: Promise<{ talentId: string }> },
) {
  try {
    const cookiePair = getBackendAuthCookie(req);

    if (!cookiePair) {
      return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });
    }

    if (!API_BASE_URL) {
      return new NextResponse("API_BASE_URL_MISSING", {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const { talentId } = await params;

    const backendUrl = `${API_BASE_URL}/company/talent/${talentId}/profile`;

    const res = await fetch(backendUrl, {
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
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : "FAILED_TO_LOAD_TALENT_PROFILE";

    return new NextResponse(message, {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}