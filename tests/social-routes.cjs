const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { NextRequest } = require('next/server');
process.env.SITE_ORIGIN = 'https://www.contractpros.co.uk';
const source = fs.readFileSync('src/app/api/social/[...path]/route.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exportsObject = {};
new Function('require', 'exports', compiled)(name => name === '@/lib/config' ? { API_BASE_URL: 'https://backend.test' } : require(name), exportsObject);
const ctx = (...path) => ({ params: Promise.resolve({ path }) });
const cookies = 'cp_social_browser=browser-binding; cp_social_ticket=signup-ticket; cp_social_role=company';
const request = (path, options = {}) => new NextRequest(`https://www.contractpros.co.uk/api/social/${path}`, options);

test('provider list only exposes configured names', async () => {
  global.fetch = async () => Response.json({ providers: ['google'] });
  assert.deepEqual(await (await exportsObject.GET(request('providers'), ctx('providers'))).json(), { providers: ['google'] });
});
test('Apple start uses a secure HttpOnly cookie for the form_post callback', async () => {
  global.fetch = async () => Response.json({ authorization_url: 'https://appleid.apple.com/auth/authorize?state=test', browser_token: 'secret-binding' });
  const response = await exportsObject.GET(request('apple/start?role=company'), ctx('apple','start'));
  assert.equal(response.status,303);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
  assert.match(response.headers.get('set-cookie'), /Secure/);
  assert.match(response.headers.get('set-cookie'), /SameSite=none/);
  assert.equal(response.cookies.get('cp_social_role').value, 'company');
});
test('unexpected authorization host is rejected', async () => {
  global.fetch = async () => Response.json({ authorization_url: 'https://example.com/steal', browser_token: 'secret' });
  const response=await exportsObject.GET(request('google/start'),ctx('google','start'));
  assert.match(response.headers.get('location'), /error=SOCIAL_FAILED/);
});
test('Apple form_post forwards browser binding and stores signup ticket in HttpOnly cookie', async () => {
  global.fetch=async (url,options)=>{
    const body=JSON.parse(options.body);
    assert.equal(body.browser_token,'browser-binding');
    assert.equal(body.code,'apple-code');
    return Response.json({status:'signup_required',ticket:'one-use-ticket'});
  };
  const req=request('apple/callback',{method:'POST',headers:{Cookie:cookies,'Content-Type':'application/x-www-form-urlencoded'},body:'code=apple-code&state=valid-state'});
  const response=await exportsObject.POST(req,ctx('apple','callback'));
  assert.match(response.headers.get('location'), /register\?social=1&role=company/);
  assert.equal(response.cookies.get('cp_social_ticket').value,'one-use-ticket');
  assert.match(response.headers.get('set-cookie'),/HttpOnly/);
});
test('login callback stores session without putting tokens in the redirect', async () => {
  global.fetch=async()=>Response.json({status:'signed_in',cookie:'enginuity_auth=test-jwt',role:'professional'});
  const response=await exportsObject.GET(request('google/callback?code=test&state=state',{headers:{Cookie:cookies}}),ctx('google','callback'));
  assert.equal(response.headers.get('location'),'https://www.contractpros.co.uk/dashboard/professional');
  assert.equal(response.cookies.get('backend_session').value,'enginuity_auth=test-jwt');
  assert.equal(response.cookies.get('cp_social_browser').value,'');
});
test('cancelled social login clears state and shows a recoverable message', async () => {
  global.fetch=async()=>assert.fail('Cancelled flow must not exchange codes');
  const response=await exportsObject.GET(request('google/callback?error=access_denied',{headers:{Cookie:cookies}}),ctx('google','callback'));
  assert.match(response.headers.get('location'),/error=SOCIAL_CANCELLED/);
  assert.equal(response.cookies.get('cp_social_browser').value,'');
});
test('cross-site completion cannot create an account', async () => {
  global.fetch=async()=>assert.fail('Cross-site completion must not reach backend');
  const response=await exportsObject.POST(request('complete',{method:'POST',headers:{Origin:'https://other.example',Cookie:cookies},body:'{}'}),ctx('complete'));
  assert.equal(response.status,403);
});
test('completion returns no session token in browser-readable JSON', async () => {
  global.fetch=async()=>Response.json({status:'signed_in',cookie:'enginuity_auth=secret-jwt',role:'company'});
  const response=await exportsObject.POST(request('complete',{method:'POST',headers:{Origin:'https://www.contractpros.co.uk',Cookie:cookies},body:'{}'}),ctx('complete'));
  assert.deepEqual(await response.json(),{status:'signed_in'});
  assert.equal(response.cookies.get('backend_session').value,'enginuity_auth=secret-jwt');
});
