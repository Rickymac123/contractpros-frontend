import {NextRequest,NextResponse} from "next/server";
import {API_BASE_URL} from "@/lib/config";
export async function GET(req:NextRequest,{params}:{params:Promise<{talentId:string}>}) {
 const session=req.cookies.get("backend_session")?.value;
 if(!session)return NextResponse.json({detail:"NOT_AUTHENTICATED"},{status:401});
 const {talentId}=await params;if(!/^\d+$/.test(talentId))return new NextResponse(null,{status:400});
 try {const response=await fetch(`${API_BASE_URL}/uploads/cv/${talentId}`,{headers:{Cookie:session},redirect:"manual",cache:"no-store",signal:AbortSignal.timeout(15000)});
 const location=response.headers.get("location");
 if(response.status===307&&location&&new URL(location).protocol==="https:")return new NextResponse(null,{status:307,headers:{Location:location,"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"}});
 return NextResponse.json({detail:"CV_UNAVAILABLE"},{status:response.status>=400?response.status:502});
 }catch{return new NextResponse(null,{status:502});}
}
