import {NextRequest,NextResponse} from "next/server";
import {API_BASE_URL} from "@/lib/config";
export async function GET(req:NextRequest){const session=req.cookies.get("backend_session")?.value;if(!session)return new NextResponse(null,{status:401});try{const response=await fetch(`${API_BASE_URL}/bookings/`,{headers:{Cookie:session},cache:"no-store",signal:AbortSignal.timeout(15000)});return NextResponse.json(await response.json(),{status:response.status});}catch{return NextResponse.json({detail:"UNAVAILABLE"},{status:502});}}
