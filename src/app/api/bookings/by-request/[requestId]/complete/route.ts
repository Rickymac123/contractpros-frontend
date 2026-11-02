import {NextRequest, NextResponse} from 'next/server';
import {API_BASE_URL} from '@/lib/config';
export async function POST(req: NextRequest, context: {params: Promise<{requestId: string}>}) {
 const session=req.cookies.get('backend_session')?.value;
 if(!session)return NextResponse.json({detail:'NOT_AUTHENTICATED'},{status:401});
 const {requestId}=await context.params;
 if(!/^\d+$/.test(requestId))return NextResponse.json({detail:'INVALID_ID'},{status:400});
 const body = {};
 try{const response=await fetch(`${API_BASE_URL}/bookings/by-request/${requestId}/complete`,{method:'POST',headers:{Cookie:session,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 return NextResponse.json(await response.json(),{status:response.status});
 }catch{return NextResponse.json({detail:'UNAVAILABLE'},{status:502});}
}
