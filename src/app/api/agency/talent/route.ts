import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getSessionCookie(req: NextRequest): string | null {
  return req.cookies.get("backend_session")?.value ?? null;
}

/**
 * GET /api/agency/talent
 *
 * - Without ?id: list all talent for agency  -> GET /talent/
 * - With ?id=1: get single talent           -> GET /talent/1
 */
export async function GET(req: NextRequest) {
  const session = getSessionCookie(req);
  if (!session) {
    return NextResponse.json(
      { detail: "NOT_AUTHENTICATED" },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    const upstream = await fetch(
      id ? `${API_BASE_URL}/talent/${id}` : `${API_BASE_URL}/talent/`,
      {
        headers: {
          Cookie: session,
          Accept: "application/json",
        },
      },
    );

    const text = await upstream.text();

    if (!upstream.ok) {
      try {
        const parsed = text ? JSON.parse(text) : null;
        if (parsed && typeof parsed === "object") {
          return NextResponse.json(parsed, { status: upstream.status });
        }
      } catch {
        // ignore JSON parse error
      }

      return NextResponse.json(
        {
          detail: `TALENT_GET_STATUS_${upstream.status}: ${
            text || "(empty body)"
          }`,
        },
        { status: upstream.status },
      );
    }

    const data = text ? JSON.parse(text) : id ? null : [];
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        detail: `INTERNAL_TALENT_GET_ERROR: ${
          typeof err?.message === "string" ? err.message : String(err)
        }`,
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/agency/talent
 *
 * Create new talent -> POST /talent/
 */
export async function POST(req: NextRequest) {
  const session = getSessionCookie(req);
  if (!session) {
    return NextResponse.json(
      { detail: "NOT_AUTHENTICATED" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();

    const upstream = await fetch(`${API_BASE_URL}/talent/`, {
      method: "POST",
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
      } catch {
        // ignore
      }

      return NextResponse.json(
        {
          detail: `TALENT_CREATE_STATUS_${upstream.status}: ${
            text || "(empty body)"
          }`,
        },
        { status: upstream.status },
      );
    }

    const data = text ? JSON.parse(text) : null;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      {
        detail: `INTERNAL_TALENT_CREATE_ERROR: ${
          typeof err?.message === "string" ? err.message : String(err)
        }`,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/agency/talent?id=1
 *
 * Delete talent -> DELETE /talent/1
 */
export async function DELETE(req: NextRequest) {
  const session = getSessionCookie(req);
  if (!session) {
    return NextResponse.json(
      { detail: "NOT_AUTHENTICATED" },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { detail: "MISSING_TALENT_ID_IN_QUERY" },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}/talent/${id}`, {
      method: "DELETE",
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
      } catch {
        // ignore
      }

      return NextResponse.json(
        {
          detail: `TALENT_DELETE_STATUS_${upstream.status}: ${
            text || "(empty body)"
          }`,
        },
        { status: upstream.status },
      );
    }

    return NextResponse.json({ detail: "DELETED" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        detail: `INTERNAL_TALENT_DELETE_ERROR: ${
          typeof err?.message === "string" ? err.message : String(err)
        }`,
      },
      { status: 500 },
    );
  }
}