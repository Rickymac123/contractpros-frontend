"use client";
import {useState} from "react";
export default function BusinessVacancyLink({jobId}:{jobId:number}) {
 const [busy,setBusy]=useState(false);
 async function open(){setBusy(true);const next=`/dashboard/marketplace/jobs#job-${jobId}`;try{const r=await fetch('/api/auth/me',{cache:'no-store'});window.location.assign(r.ok?next:`/login?next=${encodeURIComponent(next)}`);}catch{window.location.assign(`/login?next=${encodeURIComponent(next)}`);}}
 return <button type="button" disabled={busy} onClick={()=>void open()} className="mt-4 inline-block text-purple-700 underline">{busy?'Opening…':'View role and apply →'}</button>;
}
