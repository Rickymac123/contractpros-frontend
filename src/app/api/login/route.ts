// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      email?: string;
      password?: string;
    } | null;

    const email = body?.email ?? "";
    const password = body?.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ detail: "MISSING_CREDENTIALS" }, { status: 400 });
    }

    const form = new URLSearchParams();
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

    const backendSetCookie = loginRes.headers.get("set-cookie") ?? "";
    const cookiePair = backendSetCookie.split(";")[0]; // "enginuity_auth=..."

    if (!cookiePair) {
      return NextResponse.json({ detail: "NO_AUTH_COOKIE" }, { status: 500 });
    }

    // Verify user
    const meRes = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Cookie: cookiePair,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const meText = await meRes.text();
    if (!meRes.ok) {
      return NextResponse.json({ detail: "FAILED_TO_FETCH_USER" }, { status: meRes.status });
    }

    const user = meText ? JSON.parse(meText) : null;

    if (user && user.is_verified === false) {
      // ensure any existing cookie gets cleared in browser
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

    // Store the backend cookie pair in a single httpOnly cookie for proxies to forward
    const res = NextResponse.json({ user }, { status: 200 });
    res.cookies.set("backend_session", cookiePair, {
      httpOnly: true,
      secure: true, // codespaces is HTTPS
      sameSite: "lax",
      path: "/",
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { detail: typeof error?.message === "string" ? error.message : "INTERNAL_LOGIN_ERROR" },
      { status: 500 },
    );
  }
}