export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json(
    { ok: true, commit: process.env.VERCEL_GIT_COMMIT_SHA || null },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
