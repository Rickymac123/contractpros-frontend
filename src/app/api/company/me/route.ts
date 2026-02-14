import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function buildAuthCookie(req: NextRequest) {
  let v = req.cookies.get("backend_session")?.value ?? "";
  if (!v) return "";

  try {
    v = decodeURIComponent(v);
  } catch {
    // ignore
  }

  v = v.trim();

  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }

  if (v.includes(";")) v = v.split(";")[0].trim();

  if (!v.includes("=")) {
    return `enginuity_auth=${v}`;
  }

  const [k, ...rest] = v.split("=");
  const token = rest.join("=");
  if (!token) return "";

  if (k !== "enginuity_auth") {
    return `enginuity_auth=${token}`;
  }

  return `enginuity_auth=${token}`;
}

export async function GET(req: NextRequest) {
  const cookie = buildAuthCookie(req);
  if (!cookie) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const upstream = await fetch(`${API_BASE_URL}/companies/me`, {
    headers: { Cookie: cookie, Accept: "application/json" },
    cache: "no-store",
  });

  const text = await upstream.text();
  try {
    return NextResponse.json(text ? JSON.parse(text) : null, { status: upstream.status });
  } catch {
    return NextResponse.json({ detail: text || "EMPTY" }, { status: upstream.status });
  }
}

export async function PATCH(req: NextRequest) {
  const cookie = buildAuthCookie(req);
  if (!cookie) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const body = await req.text();

  const upstream = await fetch(`${API_BASE_URL}/companies/me`, {
    method: "PATCH",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  try {
    return NextResponse.json(text ? JSON.parse(text) : null, { status: upstream.status });
  } catch {
    return NextResponse.json({ detail: text || "EMPTY" }, { status: upstream.status });
  }
}