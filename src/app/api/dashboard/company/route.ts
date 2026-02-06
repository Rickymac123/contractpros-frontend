import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("backend_session")?.value;

    if (!session) {
      return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const res = await fetch(`${API_BASE_URL}/dashboard/company`, {
      cache: "no-store",
      headers: {
        Cookie: session,
        Accept: "application/json",
      },
    });

    const text = await res.text();

    if (!res.ok) {
      let detail = `DASHBOARD_COMPANY_STATUS_${res.status}: ${text || "EMPTY"}`;
      try {
        const parsed = text ? JSON.parse(text) : null;
        if (parsed && typeof parsed === "object" && "detail" in parsed) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          detail = (parsed as any).detail ?? detail;
        }
      } catch {
        // ignore
      }

      return NextResponse.json(
        { detail },
        { status: res.status, headers: { "Cache-Control": "no-store" } },
      );
    }

    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: any) {
    const msg = typeof error?.message === "string" ? error.message : String(error);
    return NextResponse.json(
      { detail: `INTERNAL_DASHBOARD_ERROR: ${msg}` },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}