import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    // Auth: read backend_session cookie that we set at login
    const session = req.cookies.get("backend_session")?.value;
    if (!session) {
      return NextResponse.json(
        { detail: "NOT_AUTHENTICATED" },
        { status: 401 },
      );
    }

    const body = await req.json();

    // Forward JSON body directly to FastAPI /jobs/
    const res = await fetch(`${API_BASE_URL}/jobs/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: session,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!res.ok) {
      let detail = `JOBS_CREATE_STATUS_${res.status}: ${text || "EMPTY"}`;
      try {
        const parsed = text ? JSON.parse(text) : null;
        if (parsed && typeof parsed === "object" && "detail" in parsed) {
          detail = (parsed as any).detail ?? detail;
        }
      } catch {
        // ignore JSON parse errors
      }

      return NextResponse.json(
        { detail },
        { status: res.status },
      );
    }

    const created = text ? JSON.parse(text) : null;
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    const msg =
      typeof error?.message === "string"
        ? error.message
        : String(error);
    return NextResponse.json(
      { detail: `INTERNAL_JOBS_CREATE_ERROR: ${msg}` },
      { status: 500 },
    );
  }
}
