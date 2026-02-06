import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function POST(req: NextRequest) {
  const session = req.cookies.get("backend_session")?.value;
  if (!session) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const formData = await req.formData();

  const upstream = await fetch(`${API_BASE_URL}/uploads/avatar`, {
    method: "POST",
    headers: {
      Cookie: session,
      // DO NOT set Content-Type here; fetch will set multipart boundary automatically
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