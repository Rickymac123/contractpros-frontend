import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getBackendCookie(req: NextRequest) {
  const raw = req.cookies.get("backend_session")?.value ?? "";
  // If stored URL-encoded (enginuity_auth%3D...), decode it
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function POST(req: NextRequest) {
  const session = getBackendCookie(req);
  if (!session) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const formData = await req.formData();

  const upstream = await fetch(`${API_BASE_URL}/uploads/avatar`, {
    method: "POST",
    headers: {
      Cookie: session,
      Accept: "application/json",
    },
    body: formData,
  });

  const text = await upstream.text();
  try {
    return NextResponse.json(text ? JSON.parse(text) : null, { status: upstream.status });
  } catch {
    return NextResponse.json({ detail: text || "EMPTY" }, { status: upstream.status });
  }
}