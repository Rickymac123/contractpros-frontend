import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getBackendAuthCookie(req: NextRequest) {
  const raw = req.cookies.get("backend_session")?.value || "";
  if (!raw) return "";

  const decoded = decodeURIComponent(raw);

  if (decoded.startsWith("enginuity_auth=")) return decoded;

  return `enginuity_auth=${decoded}`;
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ qualification_id: string }> },
) {
  const cookiePair = getBackendAuthCookie(req);
  if (!cookiePair) {
    return NextResponse.json({ detail: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { qualification_id } = await context.params;

  const res = await fetch(
    `${API_BASE_URL}/professional/qualifications/${qualification_id}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Cookie: cookiePair,
      },
      cache: "no-store",
    },
  );

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await res.text();
  return new NextResponse(text || "", {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}