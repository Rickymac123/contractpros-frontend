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

// GET: list archived company jobs
export async function GET(req: NextRequest) {
  const session = getSessionCookie(req);
  if (!session) return unauthorized();

  try {
    const upstream = await fetchWithSession(`${API_BASE_URL}/jobs/archived`, session);

    const { text, json } = await readJsonOrText(upstream);

    if (!upstream.ok) {
      if (json && typeof json === "object" && "detail" in json) {
        return NextResponse.json(json, { status: upstream.status });
      }
      return NextResponse.json(
        { detail: `ARCHIVED_JOBS_LIST_STATUS_${upstream.status}: ${text || "EMPTY"}` },
        { status: upstream.status },
      );
    }

    // backend returns a list; frontend expects an array
    return NextResponse.json(json ?? [], { status: 200 });
  } catch (err: any) {
    const msg =
      typeof err?.message === "string"
        ? err.message
        : "UNKNOWN_ARCHIVED_JOBS_LIST_ERROR";
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}