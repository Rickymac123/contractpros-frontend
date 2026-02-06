import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    // Read backend auth cookie
    const session = req.cookies.get("backend_session")?.value;

    if (!session) {
      return NextResponse.json(
        { detail: "NOT_AUTHENTICATED" },
        { status: 401 },
      );
    }

    // ✅ Accept BOTH job_id and jobId (prevents frontend mismatch bugs)
    const url = req.nextUrl;
    const jobIdRaw =
      url.searchParams.get("job_id") ??
      url.searchParams.get("jobId");

    if (!jobIdRaw || Number.isNaN(Number(jobIdRaw))) {
      return NextResponse.json(
        { detail: "INVALID_JOB_ID" },
        { status: 400 },
      );
    }

    const jobId = Number(jobIdRaw);

    // Forward request to FastAPI
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/applications`, {
      headers: {
        Cookie: session,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      let detail: unknown = text || `JOB_APPLICATIONS_STATUS_${res.status}`;

      try {
        const parsed = text ? JSON.parse(text) : null;
        if (parsed && typeof parsed === "object" && "detail" in parsed) {
          detail = (parsed as any).detail ?? detail;
        }
      } catch {
        // ignore parse errors
      }

      return NextResponse.json(
        { detail },
        { status: res.status },
      );
    }

    const data = text ? JSON.parse(text) : [];
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    const msg =
      typeof error?.message === "string"
        ? error.message
        : String(error);

    return NextResponse.json(
      { detail: `INTERNAL_JOB_APPLICATIONS_ERROR: ${msg}` },
      { status: 500 },
    );
  }
}