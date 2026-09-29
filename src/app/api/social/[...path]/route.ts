import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";
const providers = ["google", "apple", "facebook"];
function origin(req: NextRequest) {
  return process.env.SITE_ORIGIN || (process.env.NODE_ENV === "development" ? req.nextUrl.origin : "https://www.contractpros.co.uk");
}
function cookieOptions(req: NextRequest) {
  return { httpOnly: true, secure: new URL(origin(req)).protocol === "https:", sameSite: "lax" as const, path: "/", maxAge: 600 };
}
async function upstream(path: string, body?: unknown) {
  return fetch(`${API_BASE_URL}/auth/social/${path}`, {
    method: body === undefined ? "GET" : "POST", cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(20000),
  });
}
function clearFlow(res: NextResponse, req: NextRequest) {
  for (const name of ["cp_social_browser", "cp_social_ticket", "cp_social_role"]) res.cookies.set(name, "", { ...cookieOptions(req), maxAge: 0 });
}
function setSession(res: NextResponse, req: NextRequest, cookie: string) {
  const hostname = new URL(origin(req)).hostname;
  res.cookies.set("backend_session", cookie, { ...cookieOptions(req), maxAge: 3600,
    domain: hostname === "contractpros.co.uk" || hostname.endsWith(".contractpros.co.uk") ? ".contractpros.co.uk" : undefined });
}
function destination(role: string) { return ["company", "agency", "professional", "admin"].includes(role) ? `/dashboard/${role}` : "/login"; }
function failure(req: NextRequest, error: string) {
  const url = new URL("/login", origin(req)); url.searchParams.set("error", error);
  const res = NextResponse.redirect(url, 303); clearFlow(res, req); return res;
}
function ticket(req: NextRequest) { return { token: req.cookies.get("cp_social_ticket")?.value || "", browser_token: req.cookies.get("cp_social_browser")?.value || "" }; }

type Context = { params: Promise<{ path: string[] }> };
async function handler(req: NextRequest, context: Context) {
  const { path } = await context.params;
  const [provider, action] = path;
  try {
    if (path.length === 1 && provider === "providers" && req.method === "GET") {
      const response = await upstream("providers");
      return NextResponse.json(response.ok ? await response.json() : { providers: [] }, { headers: { "Cache-Control": "no-store" } });
    }
    if (path.length === 2 && providers.includes(provider) && action === "start" && req.method === "GET") {
      const response = await upstream(`${provider}/start`, {});
      if (!response.ok) return failure(req, "SOCIAL_NOT_CONFIGURED");
      const data = await response.json();
      const target = new URL(data.authorization_url);
      const allowed = { google: "accounts.google.com", apple: "appleid.apple.com", facebook: "www.facebook.com" };
      if (target.protocol !== "https:" || target.hostname !== allowed[provider as keyof typeof allowed]) return failure(req, "SOCIAL_FAILED");
      const res = NextResponse.redirect(target, 303);
      res.cookies.set("cp_social_browser", data.browser_token, { ...cookieOptions(req), sameSite: provider === "apple" ? "none" : "lax" });
      res.cookies.set("cp_social_ticket", "", { ...cookieOptions(req), maxAge: 0 });
      const role = req.nextUrl.searchParams.get("role") || "professional";
      res.cookies.set("cp_social_role", ["professional", "company", "agency"].includes(role) ? role : "professional", { ...cookieOptions(req), sameSite: provider === "apple" ? "none" : "lax" });
      return res;
    }
    if (path.length === 2 && providers.includes(provider) && action === "callback") {
      const fields = req.method === "POST" ? await req.formData() : req.nextUrl.searchParams;
      if (fields.get("error")) return failure(req, "SOCIAL_CANCELLED");
      const response = await upstream(`${provider}/exchange`, {
        state: fields.get("state"), code: fields.get("code"), browser_token: req.cookies.get("cp_social_browser")?.value || "",
      });
      const data = await response.json();
      if (!response.ok) return failure(req, typeof data.detail === "string" ? data.detail : "SOCIAL_FAILED");
      if (data.status === "signup_required") {
        const res = NextResponse.redirect(new URL(`/register?social=1&role=${encodeURIComponent(req.cookies.get("cp_social_role")?.value || "professional")}`, origin(req)), 303);
        res.cookies.set("cp_social_ticket", data.ticket, cookieOptions(req));
        // Reset the browser binding to same-site once Apple's cross-site POST is complete.
        res.cookies.set("cp_social_browser", req.cookies.get("cp_social_browser")!.value, cookieOptions(req));
        return res;
      }
      if (data.status !== "signed_in" || typeof data.cookie !== "string") return failure(req, "SOCIAL_FAILED");
      const res = NextResponse.redirect(new URL(destination(data.role), origin(req)), 303);
      clearFlow(res, req); setSession(res, req, data.cookie); return res;
    }
    if (path.length === 1 && provider === "pending" && req.method === "GET") {
      const response = await upstream("pending", ticket(req));
      return NextResponse.json(await response.json(), { status: response.status, headers: { "Cache-Control": "no-store" } });
    }
    if (path.length === 1 && provider === "complete" && req.method === "POST") {
      if (req.headers.get("origin") !== origin(req)) return NextResponse.json({ detail: "INVALID_ORIGIN" }, { status: 403 });
      const profile = await req.json();
      const response = await upstream("complete", { ...ticket(req), profile });
      const data = await response.json();
      if (!response.ok) return NextResponse.json({ detail: data.detail }, { status: response.status });
      const res = NextResponse.json({ status: data.status });
      clearFlow(res, req);
      if (data.status === "signed_in") setSession(res, req, data.cookie);
      return res;
    }
    return NextResponse.json({ detail: "NOT_FOUND" }, { status: 404 });
  } catch {
    if (action === "start" || action === "callback") return failure(req, "SOCIAL_FAILED");
    return NextResponse.json({ detail: "SOCIAL_FAILED" }, { status: 502 });
  }
}
export { handler as GET, handler as POST };
