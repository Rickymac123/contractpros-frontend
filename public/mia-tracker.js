/* Optional first-party analytics. No event/identifier before an affirmative choice. */
(()=>{'use strict';
 if(window.MiaAnalytics)return;
 const script=document.currentScript,site=script?.dataset.site;if(!site)return;
 const endpoint=new URL('mia-collect.php',script.src).href,key='mia-analytics-v1:'+site;
 const routes=new Set(['/','/about','/contact','/pricing','/features','/how-it-works','/register','/signup','/sign-up','/login','/sign-in','/jobs','/contractors','/clients','/blog','/privacy','/terms','/products','/services','/booking','/vehicles','/campervan-hire','/dashboard','/other']);
 const blocked=()=>navigator.globalPrivacyControl===true||navigator.doNotTrack==='1';
 const uuid=()=>crypto.randomUUID().replaceAll('-','');
 let enabled=false,visitor=null,visit=null,engaged=0,lastTick=performance.now(),active=Date.now(),path=null,choice=null;
 const store=(k,v)=>{try{v===null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v));}catch{}};
 const read=k=>{try{return JSON.parse(localStorage.getItem(k));}catch{return null;}};
 const normalPath=()=>routes.has(location.pathname.replace(/\/$/,'')||'/')?(location.pathname.replace(/\/$/,'')||'/'):'/other';
 function flush(){if(!enabled||!visit||blocked())return;const data={v:1,site,consent:true,visitor,visit,path,engaged_ms:Math.round(engaged)};
  fetch(endpoint,{method:'POST',mode:'cors',credentials:'omit',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify(data)}).catch(()=>{});
 }
 function page(){if(!enabled)return;flush();path=normalPath();visit=uuid();engaged=0;lastTick=performance.now();flush();}
 function consent(yes,remember=true){enabled=false;visit=null;engaged=0;if(remember){choice={yes:yes===true&&!blocked(),at:Date.now()};store(key+':choice',choice);}
  if(choice?.yes&&!blocked()){const old=read(key+':visitor'),valid=old&&Date.now()-old.at<30*86400000;visitor=valid?old.id:uuid();store(key+':visitor',{id:visitor,at:valid?old.at:Date.now()});enabled=true;page();}
  else{visitor=null;store(key+':visitor',null);}document.getElementById('mia-analytics-choice')?.remove();
 }
 function banner(){document.getElementById('mia-analytics-choice')?.remove();const b=document.createElement('aside');b.id='mia-analytics-choice';b.setAttribute('aria-label','Optional website analytics');b.style.cssText='position:fixed;bottom:50px;left:16px;right:16px;max-width:620px;padding:18px;background:#fff;color:#191523;border:1px solid #a8a0b2;border-radius:12px;box-shadow:0 4px 24px #0002;z-index:2147483000;font:14px/1.5 system-ui';
  const p=document.createElement('p');p.textContent='Allow optional website analytics? We use a random browser identifier for up to 30 days to count visits and measure active time on public pages. No form entries, search terms or account details are collected. Event records are retained for 90 days. You can change your choice using Analytics settings.';b.append(p);
  for(const [text,yes]of[['Allow analytics',true],['No thanks',false]]){const button=document.createElement('button');button.type='button';button.textContent=text;button.style.cssText='margin:4px 12px 0 0;padding:9px 14px;background:#f2eef8;color:#241733;border:1px solid #8d7b9d;border-radius:6px';button.onclick=()=>consent(yes);b.append(button);}document.body.append(b);
 }
 function init(){
  const settings=document.createElement('button');settings.type='button';settings.textContent='Analytics settings';settings.style.cssText='position:fixed;bottom:8px;left:12px;z-index:2147482000;padding:6px 10px;background:#fff;color:#362742;border:1px solid #b8acbf;border-radius:5px;font:12px system-ui';settings.onclick=banner;document.body.append(settings);
  choice=read(key+':choice');if(blocked()){enabled=false;store(key+':visitor',null);}else if(choice&&Date.now()-choice.at<30*86400000){if(choice.yes)consent(true,false);}else if(script.dataset.consent!=='external')banner();
  setInterval(()=>{const now=performance.now(),delta=Math.min(1500,Math.max(0,now-lastTick));lastTick=now;if(enabled&&!document.hidden&&document.hasFocus()&&Date.now()-active<60000)engaged=Math.min(7200000,engaged+delta);},1000);
  setInterval(flush,15000);
 }
 for(const e of ['pointerdown','keydown','scroll','touchstart'])addEventListener(e,()=>{active=Date.now();},{passive:true});
 addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();lastTick=performance.now();});
 let rawPath=location.pathname;
 const changed=()=>{if(location.pathname!==rawPath){rawPath=location.pathname;page();}};
 for(const method of ['pushState','replaceState']){const old=history[method];history[method]=function(...args){const r=old.apply(this,args);changed();return r;};}addEventListener('popstate',changed);
 window.MiaAnalytics={consent,settings:banner};addEventListener('mia:analytics-consent',e=>consent(e.detail===true));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
