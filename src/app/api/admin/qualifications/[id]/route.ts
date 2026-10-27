import {NextRequest,NextResponse} from "next/server";
import {API_BASE_URL} from "@/lib/config";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
 const session=req.cookies.get("backend_session")?.value;if(!session)return new NextResponse(null,{status:401});
 try {const {id}=await params;if(!/^\d+$/.test(id))return new NextResponse(null,{status:400});
 const response=await fetch(`${API_BASE_URL}/admin/qualifications/${id}`,{method:"PATCH",headers:{Cookie:session,"Content-Type":"application/json"},body:await req.text(),cache:"no-store",signal:AbortSignal.timeout(15000)});
 return NextResponse.json(await response.json(),{status:response.status});
 }catch{return NextResponse.json({detail:"UNAVAILABLE"},{status:502});}
}
