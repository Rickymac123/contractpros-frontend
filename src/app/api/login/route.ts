import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function extractCookiePair(setCookieValue: string, cookieName: string) {
  // set-cookie: "enginuity_auth=....; Path=/; HttpOnly; SameSite=lax"
  const parts = setCookieValue.split(";");
  const first = (parts[0] || "").trim();
  if (!first.startsWith(`${cookieName}=`)) return "";
  return first; // "enginuity_auth=...."
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      email?: string;
      password?: string;
    } | null;

    const email = (body?.email ?? "").trim();
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
      cache: "no-store",
    });

    const loginText = await loginRes.text();

    if (!loginRes.ok) {
      let detail: unknown = loginText || `LOGIN_STATUS_${loginRes.status}`;
      try {
        const parsed = loginText ? JSON.parse(loginText) : null;
        if (parsed && typeof parsed === "object" && "detail" in parsed) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          detail = (parsed as any).detail ?? detail;
        }
      } catch {}
      return NextResponse.json({ detail }, { status: loginRes.status });
    }

    // --- Get enginuity_auth from backend Set-Cookie (robustly) ---
    // Next/undici may expose multiple set-cookie headers via getSetCookie()
    // @ts-expect-error - available in Next runtime
    const setCookies: string[] =
      typeof loginRes.headers.getSetCookie === "function"
        ? // @ts-expect-error
          loginRes.headers.getSetCookie()
        : [];

    const fallback = loginRes.headers.get("set-cookie");
    if (fallback) setCookies.push(fallback);

    const cookiePair =
      setCookies.map((c) => extractCookiePair(c, "enginuity_auth")).find(Boolean) ?? "";

    if (!cookiePair) {
      return NextResponse.json(
        { detail: "NO_AUTH_COOKIE_FROM_BACKEND" },
        { status: 500 },
      );
    }

    // --- Verify user using the backend cookie directly ---
    const meRes = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Cookie: cookiePair,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const meText = await meRes.text();
    if (!meRes.ok) {
      return NextResponse.json(
        { detail: `FAILED_TO_FETCH_USER: ${meText || meRes.status}` },
        { status: 500 },
      );
    }

    const user = meText ? JSON.parse(meText) : null;

    if (user && user.is_verified === false) {
      const res = NextResponse.json({ detail: "EMAIL_NOT_VERIFIED" }, { status: 403 });
      res.cookies.set("backend_session", "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    // Store EXACTLY "enginuity_auth=<token>" for downstream proxies to forward
    const res = NextResponse.json({ user }, { status: 200 });
    res.cookies.set("backend_session", cookiePair, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1h; keep aligned with backend JWT lifetime
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { detail: typeof error?.message === "string" ? error.message : "INTERNAL_LOGIN_ERROR" },
      { status: 500 },
    );
  }
}