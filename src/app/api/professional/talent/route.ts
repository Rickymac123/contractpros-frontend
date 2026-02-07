import { NextResponse } from "next/server";

// Temporary stub to satisfy Next.js route module requirements.
export async function GET() {
  return NextResponse.json({ detail: "NOT_IMPLEMENTED" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ detail: "NOT_IMPLEMENTED" }, { status: 501 });
}
