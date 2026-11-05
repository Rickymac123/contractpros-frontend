import {NextRequest,NextResponse} from 'next/server';
import {API_BASE_URL} from '@/lib/config';
export async function GET(req:NextRequest){
 const session=req.cookies.get('backend_session')?.value;
 if(!session)return NextResponse.json({detail:'Please sign in'},{status:401});
 try{const r=await fetch(`${API_BASE_URL}/admin/client-payment-terms`,{headers:{Cookie:decodeURIComponent(session)},cache:'no-store',signal:AbortSignal.timeout(15000)});return NextResponse.json(await r.json(),{status:r.status});}catch{return NextResponse.json({detail:'Unable to load client terms'},{status:503});}
}
