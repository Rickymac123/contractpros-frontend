import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("backend_session")?.value;

    if (!session) {
      return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const headers = {
      Cookie: session,
      Accept: "application/json",
    };

    const res = await fetch(`${API_BASE_URL}/admin/bookings`, { headers });

    if (res.status === 401) {
      return NextResponse.json({ detail: "NOT_AUTHORIZED" }, { status: 401 });
    }

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        {
          detail: `ADMIN_BOOKINGS_UPSTREAM_ERROR: ${res.status}: ${text
            .slice(0, 200)
            .replace(/\s+/g, " ")}`,
        },
        { status: 500 },
      );
    }

    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    const msg =
      typeof error?.message === "string" ? error.message : String(error);
    return NextResponse.json(
      { detail: `INTERNAL_ADMIN_BOOKINGS_ERROR: ${msg}` },
      { status: 500 },
    );
  }
}