import {NextRequest,NextResponse} from "next/server";
import {API_BASE_URL} from "@/lib/config";
async function forward(req:NextRequest,context:{params:Promise<{action:string}>}) {
 const {action}=await context.params;
 if(!(req.method==='GET'?['status']:['checkout','portal','redeem','refresh']).includes(action))return NextResponse.json({detail:'Not found'},{status:404});
 const raw=req.cookies.get('backend_session')?.value;
 if(!raw)return NextResponse.json({detail:'Please sign in.'},{status:401});
 const expectedOrigin = process.env.NODE_ENV === 'production' ? 'https://www.contractpros.co.uk' : `http://${req.headers.get('host')}`;
 if(req.method==='POST' && req.headers.get('origin')!==expectedOrigin)return NextResponse.json({detail:'Invalid request origin'},{status:403});
 try{const upstream=await fetch(`${API_BASE_URL}/billing/${action}`,{method:req.method,headers:{Cookie:decodeURIComponent(raw),'Content-Type':'application/json'},...(req.method==='POST'?{body:await req.text()}:{}),cache:'no-store',signal:AbortSignal.timeout(60000)});return NextResponse.json(await upstream.json(),{status:upstream.status,headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({detail:'Billing is temporarily unavailable. Please try again.'},{status:503});}
}
export const GET=forward;
export const POST=forward;
