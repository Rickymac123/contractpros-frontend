import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const secure = req.nextUrl.protocol === "https:";
  res.cookies.set("backend_session", "", { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 0 });
  // Login uses a shared-domain cookie on the live site. Clear that cookie too,
  // while retaining removal of older host-only sessions.
  const hostname = req.nextUrl.hostname;
  if (hostname === "contractpros.co.uk" || hostname.endsWith(".contractpros.co.uk")) {
    res.headers.append("Set-Cookie", `backend_session=; Path=/; Domain=.contractpros.co.uk; Max-Age=0; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`);
  }
  return res;
}
