import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSessionCookie(req: NextRequest): string | null {
  // This should contain something like: "enginuity_auth=eyJhbGciOi..."
  return req.cookies.get("backend_session")?.value ?? null;
}

export async function POST(req: NextRequest) {
  const session = getSessionCookie(req);
  if (!session) {
    return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const upstream = await fetch(`${API_BASE_URL}/uploads/cv`, {
      method: "POST",
      headers: {
        Cookie: session,
        // IMPORTANT: do NOT set Content-Type here; fetch will set the boundary.
        Accept: "application/json",
      },
      body: formData,
      cache: "no-store",
    });

    const text = await upstream.text();

    // pass through JSON if possible
    try {
      const parsed = text ? JSON.parse(text) : null;
      return NextResponse.json(parsed, { status: upstream.status });
    } catch {
      return new NextResponse(text || "", {
        status: upstream.status,
        headers: { "Content-Type": upstream.headers.get("content-type") || "text/plain" },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { detail: `UPLOAD_CV_PROXY_ERROR: ${typeof err?.message === "string" ? err.message : String(err)}` },
      { status: 500 },
    );
  }
}