import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getSessionCookie(req: NextRequest) {
  return req.cookies.get("backend_session")?.value ?? null;
}

function unauthorized() {
  return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });
}

function invalidId() {
  return NextResponse.json(
    { detail: "MISSING_OR_INVALID_JOB_ID" },
    { status: 400 },
  );
}

type AllowedMethod = "GET" | "PATCH" | "PUT" | "DELETE";

async function forwardToBackend(req: NextRequest, method: AllowedMethod, id: number) {
  const session = getSessionCookie(req);
  if (!session) return unauthorized();

  // Backend supports GET/PATCH/DELETE. Translate PUT -> PATCH upstream.
  const upstreamMethod: "GET" | "PATCH" | "DELETE" =
    method === "PUT" ? "PATCH" : method;

  const headers: Record<string, string> = {
    Cookie: session,
    Accept: "application/json",
  };

  let body: string | undefined;

  if (upstreamMethod === "PATCH") {
    const jsonBody = await req.json();
    body = JSON.stringify(jsonBody);
    headers["Content-Type"] = "application/json";
  }

  const upstream = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: upstreamMethod,
    headers,
    body,
  });

  const text = await upstream.text();

  // 204 No Content (common for DELETE archive) or empty body: treat as success.
  if (upstream.status === 204 || (upstream.ok && !text)) {
    return NextResponse.json(
      {
        ok: true,
        id,
        action: method === "DELETE" ? "archived" : "updated",
      },
      { status: 200 },
    );
  }

  if (!upstream.ok) {
    // Pass through backend {detail: ...} if present
    try {
      const parsed = text ? JSON.parse(text) : null;
      if (parsed && typeof parsed === "object" && "detail" in parsed) {
        return NextResponse.json(parsed, { status: upstream.status });
      }
    } catch {
      // ignore parse error
    }

    return NextResponse.json(
      { detail: `JOB_${method}_STATUS_${upstream.status}: ${text || "EMPTY"}` },
      { status: upstream.status },
    );
  }

  // Success with JSON body
  try {
    const parsed = text ? JSON.parse(text) : null;

    if (method === "GET") {
      // Keep { job: ... } because your detail/edit pages expect that shape
      return NextResponse.json({ job: parsed }, { status: 200 });
    }

    // For PUT/PATCH return updated job consistently
    return NextResponse.json({ ok: true, job: parsed }, { status: 200 });
  } catch {
    // Success but body wasn't JSON
    return NextResponse.json(
      { ok: true, id, method, raw: text },
      { status: 200 },
    );
  }
}

// Next 16+: params is a Promise in route handlers
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const idNum = Number(id);
  if (!id || Number.isNaN(idNum) || idNum <= 0) return invalidId();
  return forwardToBackend(req, "GET", idNum);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const idNum = Number(id);
  if (!id || Number.isNaN(idNum) || idNum <= 0) return invalidId();
  return forwardToBackend(req, "PATCH", idNum);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const idNum = Number(id);
  if (!id || Number.isNaN(idNum) || idNum <= 0) return invalidId();
  return forwardToBackend(req, "PUT", idNum);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const idNum = Number(id);
  if (!id || Number.isNaN(idNum) || idNum <= 0) return invalidId();
  return forwardToBackend(req, "DELETE", idNum);
}