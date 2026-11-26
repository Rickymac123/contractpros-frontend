// Optional analytics relay: fixed destination, no account/form data.
const origins = ["https://www.contractpros.co.uk", "https://contractpros.co.uk"];
export async function POST(request: Request): Promise<Response> {
 const origin = request.headers.get('origin') || '';
 if (!origins.includes(origin)) return new Response(null, {status: 403});
 if (Number(request.headers.get('content-length') || '0') > 2048) return new Response(null, {status: 413});
 try {
  const body = await request.text();
  if (body.length > 2048) return new Response(null, {status: 413});
  const event = JSON.parse(body);
  if (event.site !== 'contract-pros' || event.consent !== true) return new Response(null, {status: 422});
  const result = await fetch('https://lineiq.online/mia-collect.php', {
   method: 'POST', body, cache: 'no-store', signal: AbortSignal.timeout(6000),
   headers: {'Content-Type':'text/plain','Origin':origin,'User-Agent':(request.headers.get('user-agent') || '').slice(0,300)}
  });
  return Response.json(result.ok ? {accepted:true} : {error:'analytics unavailable'}, {status:result.ok ? 200 : 503, headers:{'Cache-Control':'no-store'}});
 } catch { return Response.json({error:'analytics unavailable'}, {status:503}); }
}
