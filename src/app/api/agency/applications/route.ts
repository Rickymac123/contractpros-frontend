import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";
export async function GET(req: NextRequest) {
  const session = req.cookies.get("backend_session")?.value;
  if (!session) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
  try {
    const response = await fetch(`${API_BASE_URL}/agency/applications`, {
      headers: { Cookie: session }, cache: "no-store",
    });
    return new NextResponse(await response.text(), { status: response.status,
      headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Applications are temporarily unavailable. Please retry." }, { status: 502 });
  }
}
