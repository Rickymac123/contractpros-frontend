import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("backend_session")?.value;

    if (!session) {
      return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    // forward query params to backend (/search/jobs?...):
    const url = new URL(req.url);
    const qs = url.searchParams.toString();
    const upstreamUrl = `${API_BASE_URL}/search/jobs${qs ? `?${qs}` : ""}`;

    const res = await fetch(upstreamUrl, {
      headers: {
        Cookie: session,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      let detail: unknown = text || `UPSTREAM_STATUS_${res.status}`;
      try {
        const parsed = text ? JSON.parse(text) : null;
        if (parsed && typeof parsed === "object" && "detail" in parsed) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          detail = (parsed as any).detail ?? detail;
        }
      } catch {
        // ignore
      }

      return NextResponse.json({ detail }, { status: res.status });
    }

    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    const msg = typeof error?.message === "string" ? error.message : String(error);
    return NextResponse.json(
      { detail: `INTERNAL_MARKETPLACE_JOBS_ERROR: ${msg}` },
      { status: 500 },
    );
  }
}