import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function DELETE(req: NextRequest) {
  try {
    const session = req.cookies.get("backend_session")?.value;

    if (!session) {
      return NextResponse.json(
        { detail: "NOT_AUTHENTICATED" },
        { status: 401 },
      );
    }

    const url = req.nextUrl;
    const id = url.searchParams.get("id");

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json(
        { detail: "INVALID_JOB_ID" },
        { status: 400 },
      );
    }

    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: session,
        Accept: "*/*",
      },
    });

    const text = await res.text();

    if (!res.ok) {
      let detail: unknown = text || `JOBS_DELETE_STATUS_${res.status}`;
      try {
        const parsed = text ? JSON.parse(text) : null;
        if (parsed && typeof parsed === "object" && "detail" in parsed) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          detail = (parsed as any).detail ?? detail;
        }
      } catch {
        // ignore JSON parse error
      }

      return NextResponse.json(
        { detail },
        { status: res.status },
      );
    }

    // FastAPI DELETE returns no body (204) – just confirm success
    return NextResponse.json(
      { ok: true },
      { status: 200 },
    );
  } catch (error: any) {
    const msg =
      typeof error?.message === "string"
        ? error.message
        : String(error);

    return NextResponse.json(
      { detail: `INTERNAL_JOB_DELETE_ERROR: ${msg}` },
      { status: 500 },
    );
  }
}