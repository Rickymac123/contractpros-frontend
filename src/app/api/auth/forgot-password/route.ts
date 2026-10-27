import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";
export async function POST(req: NextRequest) {
 try {
  const body = await req.json();
  const reset = false;
  if (reset ? typeof body.token !== "string" || typeof body.password !== "string" || body.password.length < 12 || body.password.length > 128 : typeof body.email !== "string" || !body.email.includes("@")) return NextResponse.json({detail:"INVALID_INPUT"}, {status:400});
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(reset ? {token:body.token,password:body.password} : {email:body.email.trim()}), signal:AbortSignal.timeout(22000), cache:"no-store"});
  return NextResponse.json({ok:response.ok}, {status:response.ok ? 200 : response.status >= 500 ? 502 : 400});
 } catch { return NextResponse.json({ok:false}, {status:502}); }
}
