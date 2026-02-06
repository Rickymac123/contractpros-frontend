import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getSessionCookie(req: NextRequest) {
  return req.cookies.get("backend_session")?.value ?? null;
}

function unauthorized() {
  return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
}

async function readJsonOrText(res: Response) {
  const text = await res.text();
  try {
    return { text, json: text ? JSON.parse(text) : null };
  } catch {
    return { text, json: null };
  }
}

async function fetchWithSession(url: string, session: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      Cookie: session,
      Accept: "application/json",
      ...(init?.headers || {}),
    },
  });
}

// ---------- GET: list company jobs (active by default; archived via ?archived=1) ----------
export async function GET(req: NextRequest) {
  const session = getSessionCookie(req);
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const archivedRaw = searchParams.get("archived");
    const archived =
      archivedRaw === "1" || archivedRaw === "true" || archivedRaw === "yes";

    // FastAPI routes you added:
    // - active:   GET /jobs/
    // - archived: GET /jobs/archived
    const upstreamUrl = archived
      ? `${API_BASE_URL}/jobs/archived`
      : `${API_BASE_URL}/jobs/`;

    const upstream = await fetchWithSession(upstreamUrl, session);
    const { text, json } = await readJsonOrText(upstream);

    if (!upstream.ok) {
      if (json && typeof json === "object" && "detail" in json) {
        return NextResponse.json(json, { status: upstream.status });
      }
      return NextResponse.json(
        { detail: `JOBS_LIST_STATUS_${upstream.status}: ${text || "EMPTY"}` },
        { status: upstream.status },
      );
    }

    // Backend returns a list
    return NextResponse.json(json ?? [], { status: 200 });
  } catch (err: any) {
    const msg =
      typeof err?.message === "string" ? err.message : "UNKNOWN_JOBS_LIST_ERROR";
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}

// ---------- POST: create a new job ----------
export async function POST(req: NextRequest) {
  const session = getSessionCookie(req);
  if (!session) return unauthorized();

  try {
    const payload = await req.json();

    const upstream = await fetchWithSession(`${API_BASE_URL}/jobs/`, session, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const { text, json } = await readJsonOrText(upstream);

    if (!upstream.ok) {
      if (json && typeof json === "object" && "detail" in json) {
        return NextResponse.json(json, { status: upstream.status });
      }
      return NextResponse.json(
        { detail: `JOB_CREATE_STATUS_${upstream.status}: ${text || "EMPTY"}` },
        { status: upstream.status },
      );
    }

    return NextResponse.json(json, { status: 201 });
  } catch (err: any) {
    const msg =
      typeof err?.message === "string" ? err.message : "UNKNOWN_JOB_CREATE_ERROR";
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}