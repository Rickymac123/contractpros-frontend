const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');
const base='http://127.0.0.1:3102';const output=process.env.TEST_OUTPUT||'/tmp';
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});const results=[];const contexts={};
for(const role of ['professional','company','agency','admin']){const context=await browser.newContext({viewport:{width:390,height:844}});contexts[role]=context;
 const login=await context.request.post(base+'/api/login',{data:{email:role+'@example.com',password:'Local-test-password-2026'}});assert.equal(login.status(),200,await login.text());
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const paths={professional:['','/profile','/availability','/applications','/booking-requests'],company:['','/jobs','/jobs/new','/booking-requests'],agency:['','/talent'],admin:['','/users','/qualifications']};
 for(const path of paths[role]){const route='/dashboard/'+role+path;await page.goto(base+route,{waitUntil:"networkidle"});await page.waitForTimeout(350);assert(!page.url().includes('/login'),route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Overflow: '+route);results.push({route,role,mobile:'passed'});}
 assert.equal(errors.length,0,errors.join('\n'));await page.screenshot({path:output+'/'+role+'-dashboard.png',fullPage:true});}
const company=contexts.company.request,pro=contexts.professional.request;
let r=await company.post(base+'/api/company/jobs',{data:{title:'Local browser test job',description:'Local disposable acceptance test',profession:'Engineer'}});assert.equal(r.status(),201,await r.text());const job=await r.json();
r=await pro.post(base+`/api/marketplace/jobs/${job.id}/apply`,{data:{notes:'Local test application'}});assert.equal(r.status(),200,await r.text());const application=await r.json();
r=await company.patch(base+`/api/applications/${application.id}`,{data:{status:'shortlisted'}});assert.equal(r.status(),200,await r.text());
const booking={talent_id:101,jobpost_id:job.id,application_id:application.id,start_date:'2027-01-04',end_date:'2027-01-05',start_time:'09:00:00',end_time:'17:00:00',site_name:'Local test',site_address:'London',contact_name:'Test',contact_phone:'07000000000'};
r=await company.post(base+'/api/company/booking-requests',{data:booking});assert.equal(r.status(),200,await r.text());const request=await r.json();
r=await pro.post(base+`/api/professional/booking-requests/${request.id}/accept`);assert.equal(r.status(),200,await r.text());
r=await pro.get(base+'/api/bookings');assert.equal(r.status(),200);assert.equal((await r.json()).length,1);results.push({journey:'company job → professional application → shortlist → request → accept → booking',status:'passed'});
const page=await contexts.professional.newPage();await page.goto(base+'/dashboard/professional');await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.goto(base+'/dashboard/professional/availability');await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:output+'/calendar-mobile.png',fullPage:true});
// Public pages and account recovery.
const guest=await browser.newContext({viewport:{width:390,height:844}});const publicPage=await guest.newPage();
for(const path of ['/privacy','/terms','/forgot-password','/reset-password','/reviews/submit','/reviews/verify']){const r=await publicPage.goto(base+path);assert.equal(r.status(),200);assert.equal(await publicPage.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,path);results.push({route:path,mobile:'passed'});}
await publicPage.goto(base+'/forgot-password');await publicPage.getByLabel('Email address').fill('professional@example.com');await publicPage.getByRole('button',{name:'Request reset link'}).click();await publicPage.getByRole('status').waitFor();
let mail=JSON.parse(fs.readFileSync('/tmp/contractpros-launch-mail.json','utf8'));await publicPage.goto(base+'/reset-password?token='+encodeURIComponent(mail.token));await publicPage.getByLabel('New password',{exact:true}).fill('Updated-test-password-2026');await publicPage.getByLabel('Confirm new password').fill('Updated-test-password-2026');await publicPage.getByRole('button',{name:'Update password'}).click();await publicPage.getByRole('status').filter({hasText:'Password updated'}).waitFor();
r=await guest.request.post(base+'/api/login',{data:{email:'professional@example.com',password:'Updated-test-password-2026'}});assert.equal(r.status(),200,await r.text());results.push({journey:'password reset email capture → reset form → login',status:'passed'});
await pro.post(base+'/api/login',{data:{email:'professional@example.com',password:'Updated-test-password-2026'}});
// Review invite, public submission and explicit confirmation.
r=await pro.post(base+'/api/professional/review-invites');assert.equal(r.status(),200,await r.text());const invite=await r.json();await publicPage.goto(invite.invite_url);
await publicPage.getByLabel('Your name').fill('Local Reviewer');await publicPage.getByLabel('Email address').fill('reviewer@example.com');await publicPage.getByLabel('Your review',{exact:false}).fill('This is a local acceptance test review of a reliable professional who completed the work to a high standard.');await publicPage.getByRole('button',{name:'Submit review'}).click();await publicPage.getByRole('status').filter({hasText:'Review saved'}).waitFor();mail=JSON.parse(fs.readFileSync('/tmp/contractpros-launch-mail.json','utf8'));await publicPage.goto(mail.url);await publicPage.getByRole('button',{name:'Confirm my review'}).click();await publicPage.getByRole('status').filter({hasText:'Your review is confirmed'}).waitFor();results.push({journey:'review invite → submit → captured email → confirm',status:'passed'});
await publicPage.screenshot({path:output+'/review-confirmed-mobile.png',fullPage:true});
await guest.request.post(base+'/api/logout');await publicPage.goto(base+'/dashboard/company');assert(publicPage.url().includes('/login'));results.push({journey:'logged-out dashboard redirect',status:'passed'});
fs.writeFileSync(output+'/launch-browser-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
