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

async function readJsonOrText(res: Response) {
  const text = await res.text();
  try {
    return { text, json: text ? JSON.parse(text) : null };
  } catch {
    return { text, json: null };
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = getSessionCookie(req);
  if (!session) return unauthorized();

  const { id } = await context.params;
  const idNum = Number(id);
  if (!id || Number.isNaN(idNum) || idNum <= 0) return invalidId();

  try {
    const upstream = await fetch(`${API_BASE_URL}/jobs/${idNum}/restore`, {
      method: "POST",
      headers: {
        Cookie: session,
        Accept: "application/json",
      },
    });

    const { text, json } = await readJsonOrText(upstream);

    if (!upstream.ok) {
      if (json && typeof json === "object" && "detail" in json) {
        return NextResponse.json(json, { status: upstream.status });
      }
      return NextResponse.json(
        { detail: `JOB_RESTORE_STATUS_${upstream.status}: ${text || "EMPTY"}` },
        { status: upstream.status },
      );
    }

    // normalize shape for the frontend
    return NextResponse.json({ ok: true, job: json }, { status: 200 });
  } catch (err: any) {
    const msg =
      typeof err?.message === "string"
        ? err.message
        : "UNKNOWN_JOB_RESTORE_ERROR";
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}