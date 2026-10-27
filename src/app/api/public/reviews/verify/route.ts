import {NextRequest,NextResponse} from "next/server";
import {API_BASE_URL} from "@/lib/config";
export async function POST(req:NextRequest){try{const {token}=await req.json();if(typeof token!=="string"||!token)return NextResponse.json({detail:"INVALID_TOKEN"},{status:400});const response=await fetch(`${API_BASE_URL}/public/reviews/verify?token=${encodeURIComponent(token)}`,{method:"POST",cache:"no-store",signal:AbortSignal.timeout(15000)});return NextResponse.json(await response.json(),{status:response.status});}catch{return NextResponse.json({detail:"UNAVAILABLE"},{status:502});}}
