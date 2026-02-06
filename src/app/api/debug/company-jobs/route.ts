import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("backend_session")?.value;

  if (!session) {
    return NextResponse.json({ detail: "NO_SESSION" }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}/jobs/`, {
    headers: {
      Cookie: session,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}