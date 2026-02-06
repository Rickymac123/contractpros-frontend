import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("backend_session")?.value;

    if (!session) {
      return NextResponse.json(
        { detail: "NOT_AUTHENTICATED" },
        { status: 401 },
      );
    }

    const res = await fetch(`${API_BASE_URL}/dashboard/agency`, {
      headers: {
        Cookie: session,
        Accept: "application/json",
      },
    });

    const text = await res.text();

    if (!res.ok) {
      let detail: unknown = text || `AGENCY_DASHBOARD_STATUS_${res.status}`;
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

    const data = text ? JSON.parse(text) : null;
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const msg =
      typeof error?.message === "string" ? error.message : String(error);

    return NextResponse.json(
      { detail: `INTERNAL_AGENCY_DASHBOARD_ERROR: ${msg}` },
      { status: 500 },
    );
  }
}