import { NextResponse } from "next/server";

// Temporary stub to satisfy Next.js route module requirements.
// Replace with real handler logic.
export async function POST() {
  return NextResponse.json(
    { detail: "NOT_IMPLEMENTED" },
    { status: 501 }
  );
}
