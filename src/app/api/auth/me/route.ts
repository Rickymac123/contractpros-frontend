import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

/**
 * GET current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("backend_session")?.value;

    if (!session) {
      return NextResponse.json(
        { detail: "NOT_AUTHENTICATED" },
        { status: 401 },
      );
    }

    const upstream = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Cookie: session,
        Accept: "application/json",
      },
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
        { detail: `AUTH_ME_UPSTREAM_STATUS_${upstream.status}` },
        { status: upstream.status },
      );
    }

    return NextResponse.json(text ? JSON.parse(text) : null, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { detail: `INTERNAL_AUTH_ME_ERROR: ${error?.message ?? String(error)}` },
      { status: 500 },
    );
  }
}

/**
 * PATCH update current user (My Account edit)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = req.cookies.get("backend_session")?.value;

    if (!session) {
      return NextResponse.json(
        { detail: "NOT_AUTHENTICATED" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const upstream = await fetch(`${API_BASE_URL}/users/me`, {
      method: "PATCH",
      headers: {
        Cookie: session,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
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
        { detail: `AUTH_ME_PATCH_UPSTREAM_STATUS_${upstream.status}` },
        { status: upstream.status },
      );
    }

    return NextResponse.json(text ? JSON.parse(text) : null, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { detail: `INTERNAL_AUTH_ME_PATCH_ERROR: ${error?.message ?? String(error)}` },
      { status: 500 },
    );
  }
}