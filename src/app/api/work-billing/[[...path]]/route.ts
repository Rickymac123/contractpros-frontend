import {NextRequest,NextResponse} from 'next/server';
import {API_BASE_URL} from '@/lib/config';
async function proxy(req:NextRequest,ctx:{params:Promise<{path?:string[]}>}){
 const session=req.cookies.get('backend_session')?.value;
 if(!session)return NextResponse.json({detail:'Please sign in'},{status:401});
 const path=(await ctx.params).path||[];
 if(path.some(p=>!/^[-a-zA-Z0-9]+$/.test(p)))return NextResponse.json({detail:'Invalid path'},{status:400});
 if(req.method!=='GET'){
  const origin=process.env.NODE_ENV==='production'?'https://www.contractpros.co.uk':`http://${req.headers.get('host')}`;
  if(req.headers.get('origin')!==origin)return NextResponse.json({detail:'Invalid request origin'},{status:403});
 }
 try{
  const callback=path.join('/')==='quickbooks/callback';
  const response=await fetch(`${API_BASE_URL}/work-billing${path.length?'/'+path.join('/'):''}${callback?req.nextUrl.search:''}`,{method:req.method,headers:{Cookie:decodeURIComponent(session),'Content-Type':'application/json'},body:req.method==='GET'?undefined:await req.text(),cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(60000)});
  if(callback&&response.status===303)return NextResponse.redirect(new URL('/dashboard/timesheets?connected=1',req.url),303);
  return NextResponse.json(await response.json(),{status:response.status});
 }catch{return NextResponse.json({detail:'Unable to confirm the result. Reload before trying again.'},{status:503});}
}
export const GET=proxy;export const POST=proxy;export const PUT=proxy;export const PATCH=proxy;
