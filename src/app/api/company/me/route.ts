import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

function getEnginuityCookie(req: NextRequest): string {
  const raw = req.cookies.get("backend_session")?.value ?? "";
  if (!raw) return "";

  let v = raw;
  try { v = decodeURIComponent(raw); } catch {}
  v = v.split(";")[0]?.trim() ?? "";

  if (v.startsWith("enginuity_auth=")) return v;
  if (v.split(".").length === 3) return `enginuity_auth=${v}`;

  if (v.startsWith("enginuity_auth%3D")) {
    const maybe = v.replace("enginuity_auth%3D", "enginuity_auth=");
    return maybe.split(";")[0]?.trim() ?? "";
  }

  return "";
}

export async function GET(req: NextRequest) {
  const cookie = getEnginuityCookie(req);
  if (!cookie) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const upstream = await fetch(`${API_BASE_URL}/companies/me`, {
    headers: { cookie, Accept: "application/json" },
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
  const cookie = getEnginuityCookie(req);
  if (!cookie) return NextResponse.json({ detail: "NOT_AUTHENTICATED" }, { status: 401 });

  const body = await req.text();

  const upstream = await fetch(`${API_BASE_URL}/companies/me`, {
    method: "PATCH",
    headers: {
      cookie,
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