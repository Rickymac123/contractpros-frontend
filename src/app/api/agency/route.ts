import { NextResponse } from "next/server";

/**
 * Root endpoint for /api/agency.
 * The UI does not call this directly, but we keep it to avoid 404 behaviour.
 * Real endpoints live under /api/agency/talent and /api/agency/talent/[id].
 */
export async function GET() {
  return NextResponse.json({
    detail: "Agency API root. Use /api/agency/talent instead."
  });
}
