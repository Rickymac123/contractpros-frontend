import {NextRequest, NextResponse} from 'next/server';
import {API_BASE_URL} from '@/lib/config';
export async function POST(req: NextRequest, context: {params: Promise<{requestId: string}>}) {
 const session=req.cookies.get('backend_session')?.value;
 if(!session)return NextResponse.json({detail:'NOT_AUTHENTICATED'},{status:401});
 const {requestId}=await context.params;
 if(!/^\d+$/.test(requestId))return NextResponse.json({detail:'INVALID_ID'},{status:400});
 let body;try{body=await req.json();}catch{return NextResponse.json({detail:'INVALID_BODY'},{status:400});}
 try{const response=await fetch(`${API_BASE_URL}/bookings/by-request/${requestId}/review`,{method:'POST',headers:{Cookie:session,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 return NextResponse.json(await response.json(),{status:response.status});
 }catch{return NextResponse.json({detail:'UNAVAILABLE'},{status:502});}
}

export async function GET(req: NextRequest, context: {params: Promise<{requestId: string}>}) {
 const session=req.cookies.get('backend_session')?.value;
 if(!session)return NextResponse.json({detail:'Please sign in to your company account.'},{status:401});
 const {requestId}=await context.params;
 if(!/^\d+$/.test(requestId))return NextResponse.json({detail:'INVALID_ID'},{status:400});
 try{const response=await fetch(`${API_BASE_URL}/bookings/by-request/${requestId}/review`,{headers:{Cookie:session},cache:'no-store',signal:AbortSignal.timeout(15000)});
 return NextResponse.json(await response.json(),{status:response.status});
 }catch{return NextResponse.json({detail:'Unable to load booking. Please try again.'},{status:502});}
}
