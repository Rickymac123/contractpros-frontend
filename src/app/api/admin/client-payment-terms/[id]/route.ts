import {NextRequest,NextResponse} from 'next/server';
import {API_BASE_URL} from '@/lib/config';
export async function PATCH(req:NextRequest,ctx:{params:Promise<{id:string}>}){
 const session=req.cookies.get('backend_session')?.value;
 if(!session)return NextResponse.json({detail:'Please sign in'},{status:401});
 const origin=process.env.NODE_ENV==='production'?'https://www.contractpros.co.uk':`http://${req.headers.get('host')}`;
 if(req.headers.get('origin')!==origin)return NextResponse.json({detail:'Invalid request origin'},{status:403});
 const {id}=await ctx.params;if(!/^\d+$/.test(id))return NextResponse.json({detail:'Invalid client'},{status:400});
 try{const r=await fetch(`${API_BASE_URL}/admin/client-payment-terms/${id}`,{method:'PATCH',headers:{Cookie:decodeURIComponent(session),'Content-Type':'application/json'},body:await req.text(),cache:'no-store',signal:AbortSignal.timeout(15000)});return NextResponse.json(await r.json(),{status:r.status});}catch{return NextResponse.json({detail:'Unable to save client terms. Reload to check the latest value.'},{status:503});}
}
