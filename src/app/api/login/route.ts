import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function pickAuthCookieFromSetCookieHeader(setCookieHeader: string): string {
  // Backend returns: "enginuity_auth=...; Path=/; HttpOnly; ..."
  const parts = setCookieHeader.split(/,(?=\s*\w+=)/g); // split on cookie boundaries
  for (const p of parts) {
    const trimmed = p.trim();
    if (trimmed.startsWith("enginuity_auth=")) {
      return trimmed.split(";")[0]; // "enginuity_auth=..."
    }
  }
  return "";
}

function getCookieOptions(req: NextRequest) {
  const isHttps = req.nextUrl.protocol === "https:";
  const host = req.headers.get("host") ?? "";

  // Only set a fixed domain on your real production domain.
  // If you set domain in dev (localhost / *.app.github.dev), the cookie won't be stored.
  const isProdDomain =
    host === "contractpros.co.uk" || host.endsWith(".contractpros.co.uk");

  return {
    httpOnly: true as const,
    secure: isHttps, // allow http localhost
    sameSite: "lax" as const,
    path: "/" as const,
    domain: isProdDomain ? ".contractpros.co.uk" : undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { email?: string; password?: string }
      | null;

    const email = body?.email?.trim() ?? "";
    const password = body?.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ detail: "MISSING_CREDENTIALS" }, { status: 400 });
    }

    const form = new URLSearchParams();
    form.set("grant_type", "password");
    form.set("username", email);
    form.set("password", password);

    const loginRes = await fetch(`${API_BASE_URL}/auth/jwt/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: form.toString(),
    });

    const loginText = await loginRes.text();

    if (!loginRes.ok) {
      let detail: unknown = loginText || `LOGIN_STATUS_${loginRes.status}`;
      try {
        const parsed = JSON.parse(loginText);
        detail = parsed?.detail ?? detail;
      } catch {}
      return NextResponse.json({ detail }, { status: loginRes.status });
    }

    const rawSetCookie = loginRes.headers.get("set-cookie") ?? "";
    const cookiePair = pickAuthCookieFromSetCookieHeader(rawSetCookie);

    if (!cookiePair) {
      return NextResponse.json({ detail: "NO_AUTH_COOKIE" }, { status: 500 });
    }

    // Validate token works by calling /users/me using the backend cookie
    const meRes = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Cookie: cookiePair, Accept: "application/json" },
      cache: "no-store",
    });

    const meText = await meRes.text();
    if (!meRes.ok) {
      return NextResponse.json({ detail: "FAILED_TO_FETCH_USER" }, { status: meRes.status });
    }

    const user = meText ? JSON.parse(meText) : null;

    const cookieOpts = getCookieOptions(req);

    if (user && user.is_verified === false) {
      const res = NextResponse.json({ detail: "EMAIL_NOT_VERIFIED" }, { status: 403 });
      res.cookies.set("backend_session", "", { ...cookieOpts, maxAge: 0 });
      return res;
    }

    const res = NextResponse.json({ user }, { status: 200 });

    // Store the backend cookie pair (enginuity_auth=...) in a single httpOnly cookie
    res.cookies.set("backend_session", cookiePair, cookieOpts);

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { detail: typeof error?.message === "string" ? error.message : "INTERNAL_LOGIN_ERROR" },
      { status: 500 },
    );
  }
}