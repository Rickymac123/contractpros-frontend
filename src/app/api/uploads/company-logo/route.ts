import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getSessionCookie(req: NextRequest): string | null {
  return req.cookies.get("backend_session")?.value ?? null;
}

export async function POST(req: NextRequest) {
  const session = getSessionCookie(req);
  if (!session) {
    return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const upstream = await fetch(`${API_BASE_URL}/uploads/company-logo`, {
      method: "POST",
      headers: {
        Cookie: session,
        Accept: "application/json",
      },
      body: formData,
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      try {
        const parsed = text ? JSON.parse(text) : null;
        if (parsed && typeof parsed === "object") {
          return NextResponse.json(parsed, { status: upstream.status });
        }
      } catch {}

      return NextResponse.json(
        { detail: `UPLOAD_COMPANY_LOGO_STATUS_${upstream.status}: ${text || "(empty body)"}` },
        { status: upstream.status },
      );
    }

    const data = text ? JSON.parse(text) : null;
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        detail: `INTERNAL_UPLOAD_COMPANY_LOGO_ERROR: ${
          typeof err?.message === "string" ? err.message : String(err)
        }`,
      },
      { status: 500 },
    );
  }
}