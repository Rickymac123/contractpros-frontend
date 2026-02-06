import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function parseJobIdFromPath(pathname: string): string | null {
  // Expected: /api/marketplace/jobs/:jobId/apply
  const m = pathname.match(/\/api\/marketplace\/jobs\/(\d+)\/apply\/?$/);
  return m?.[1] ?? null;
}

export async function POST(
  req: NextRequest,
  ctx: { params?: { jobId?: string } }
) {
  try {
    const session = req.cookies.get("backend_session")?.value;
    if (!session) {
      return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const fromParams = ctx?.params?.jobId ?? null;
    const fromPath = parseJobIdFromPath(req.nextUrl.pathname);
    const jobId = fromParams || fromPath;

    // If it STILL fails, return what we saw so you know what's happening
    if (!jobId || Number.isNaN(Number(jobId))) {
      return NextResponse.json(
        {
          detail: "INVALID_JOB_ID",
          debug: {
            pathname: req.nextUrl.pathname,
            fromParams,
            fromPath,
          },
        },
        { status: 400 }
      );
    }

    const bodyText = await req.text();

    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: "POST",
      headers: {
        Cookie: session, // session already looks like: enginuity_auth=...
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: bodyText || JSON.stringify({}),
    });

    const text = await res.text();

    if (!res.ok) {
      let detail: unknown = text || `APPLY_STATUS_${res.status}`;
      try {
        const parsed = text ? JSON.parse(text) : null;
        if (parsed && typeof parsed === "object" && "detail" in parsed) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          detail = (parsed as any).detail ?? detail;
        }
      } catch {}

      return NextResponse.json({ detail }, { status: res.status });
    }

    return NextResponse.json(text ? JSON.parse(text) : {}, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { detail: `INTERNAL_APPLY_ERROR: ${error?.message ?? String(error)}` },
      { status: 500 }
    );
  }
}