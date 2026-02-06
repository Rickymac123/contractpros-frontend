import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// Adjust this if your backend uses a different register path.
const REGISTER_PATH = "/auth/register";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(`${BACKEND_URL}${REGISTER_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
  });
}