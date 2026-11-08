import {NextRequest,NextResponse} from 'next/server';
import {API_BASE_URL} from '@/lib/config';
async function proxy(req:NextRequest,ctx:{params:Promise<{path:string[]}>}){
 const session=req.cookies.get('backend_session')?.value;
 if(!session)return NextResponse.json({detail:'Please sign in'},{status:401});
 const path=(await ctx.params).path.join('/');
 if(!/^by-request\/\d+(\/cest(\/\d+)?)?$/.test(path))return NextResponse.json({detail:'Invalid path'},{status:404});
 const allowedOrigin=process.env.NODE_ENV==='production'?'https://www.contractpros.co.uk':`http://${req.headers.get('host')}`;
 if(req.method!=='GET' && req.headers.get('origin')!==allowedOrigin)return NextResponse.json({detail:'Invalid request origin'},{status:403});
 try{
  const headers:Record<string,string>={Cookie:decodeURIComponent(session)};
  let body:BodyInit|undefined;
  if(req.method==='POST'){
   if(Number(req.headers.get('content-length')||0)>4500000)return NextResponse.json({detail:'PDF must be under 4 MB'},{status:413});
   const form=await req.formData();const file=form.get('file');
   if(!(file instanceof File)||file.size>4*1024*1024)return NextResponse.json({detail:'Choose a PDF under 4 MB'},{status:422});
   const clean=new FormData();clean.set('file',file);body=clean;
  }else if(req.method==='PUT'){headers['Content-Type']='application/json';body=await req.text();}
  const response=await fetch(`${API_BASE_URL}/ir35/${path}`,{method:req.method,headers,body,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(60000)});
  if(response.ok&&response.headers.get('content-type')?.includes('application/pdf'))return new NextResponse(await response.arrayBuffer(),{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="CEST-result.pdf"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':'sandbox'}});
  return NextResponse.json(await response.json(),{status:response.status,headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({detail:'Unable to confirm the result. Reload before trying again.'},{status:503});}
}
export const GET=proxy;export const PUT=proxy;export const POST=proxy;
