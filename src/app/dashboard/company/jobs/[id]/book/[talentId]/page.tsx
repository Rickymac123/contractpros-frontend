"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type BookingForm = {start_date:string;end_date:string;start_time:string;end_time:string;site_name:string;site_address:string;contact_name:string;contact_phone:string;notes:string};
const initial: BookingForm = {start_date:'',end_date:'',start_time:'09:00',end_time:'17:00',site_name:'',site_address:'',contact_name:'',contact_phone:'',notes:''};
const errors: Record<string,string> = {PENDING_BOOKING_REQUEST_ALREADY_EXISTS:'You already have a pending request for this professional. View your booking requests to manage it.',JOB_CLOSED:'This job has been archived. Restore it before requesting a booking.',NOT_ALLOWED_FOR_JOB:'This job is not available to your company.',TALENT_NOT_FOUND:'This professional is no longer available.'};
export default function DirectBookingPage() {
 const params = useParams<{id:string;talentId:string}>();
 const [form,setForm] = useState<BookingForm>(initial);
 const [title,setTitle] = useState(''); const [name,setName] = useState('');
 const [loading,setLoading] = useState(true); const [saving,setSaving] = useState(false);
 const [error,setError] = useState(''); const [sent,setSent] = useState(false);
 useEffect(()=>{ let cancelled=false;
  async function load(){
   try {
    const [jr,tr] = await Promise.all([fetch(`/api/company/jobs/${params.id}`,{cache:'no-store'}),fetch(`/api/company/talent/${params.talentId}/profile`,{cache:'no-store'})]);
    if(!jr.ok||!tr.ok) throw new Error('Unable to load the job or professional. Return to the job and try again.');
    const job=(await jr.json()).job;const talent=(await tr.json()).profile;
    if(!job?.title || !talent) throw new Error("The job or professional details are incomplete. Return to the job and try again.");
    if(job.is_archived) throw new Error(errors.JOB_CLOSED);
    if(cancelled)return;
    setTitle(job.title);setName([talent.first_name,talent.last_name].filter(Boolean).join(' '));
    setForm({...initial,start_date:job.start_date||'',end_date:job.end_date||'',start_time:job.start_time?.slice(0,5)||'09:00',end_time:job.end_time?.slice(0,5)||'17:00',site_name:job.site_name||'',site_address:[job.site_address||job.location,job.postcode].filter(Boolean).join(', ')});
   } catch(e){if(!cancelled)setError(e instanceof Error?e.message:'Unable to load booking details.');}
   finally{if(!cancelled)setLoading(false);}
  } void load();return()=>{cancelled=true;};
 },[params.id,params.talentId]);
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setError('');
  if(form.end_date<form.start_date||form.end_time<=form.start_time){setError('Use an end date on or after the start date and an end time after the start time. Overnight shifts need separate requests.');return;}
  if(![form.site_name,form.site_address,form.contact_name,form.contact_phone].every(v=>v.trim())){setError('Enter the site and contact details.');return;}
  setSaving(true);
  try{const response=await fetch('/api/company/booking-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,talent_id:Number(params.talentId),jobpost_id:Number(params.id),start_time:form.start_time+':00',end_time:form.end_time+':00'})});
   const result=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(errors[result.detail]||'The request could not be sent. Check the details and try again.');
   setSent(true);
  }catch(e){setError(e instanceof Error?e.message:'The request could not be sent.');}finally{setSaving(false);}
 }
 const fields: Array<[keyof BookingForm,string,string]>=[['start_date','Start date','date'],['end_date','End date','date'],['start_time','Daily start time','time'],['end_time','Daily end time','time'],['site_name','Site name','text'],['site_address','UK site address, including postcode','text'],['contact_name','On-site contact name','text'],['contact_phone','On-site contact phone','tel']];
 return <div className="mx-auto max-w-3xl space-y-6 p-6"><Link className="text-purple-300 underline" href={`/dashboard/company/jobs/${params.id}/search`}>Back to professionals</Link><h1 className="text-2xl font-semibold">Request a booking</h1>
 {loading?<p>Loading booking details…</p>:<>
 {error&&<p role="alert" className="rounded-xl border border-red-700 p-4 text-red-200">{error}</p>}
 {sent?<div role="status" className="space-y-4 rounded-2xl border border-emerald-700 p-6"><h2 className="text-xl">Booking request sent</h2><p>{name} can review and accept or decline your request. The booking is not confirmed until they accept.</p><Link className="text-purple-300 underline" href="/dashboard/company/booking-requests">View booking requests</Link></div>:title&&<form onSubmit={submit} className="space-y-5 rounded-2xl border border-neutral-800 p-6"><p><strong>{name}</strong> · {title}</p><p className="text-sm text-neutral-400">Times are Europe/London and apply to each date in the range. This sends a request; acceptance is checked against existing commitments.</p><div className="grid gap-4 sm:grid-cols-2">{fields.map(([key,label,type])=><label key={key} className="text-sm">{label}<input required type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-900 p-3" /></label>)}</div><label className="block text-sm">Additional information<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-900 p-3" /></label><button disabled={saving} className="rounded-xl bg-purple-700 px-5 py-3 disabled:opacity-50">{saving?'Sending…':'Send booking request'}</button></form>}
 <Link className="block text-sm text-purple-300 underline" href="/dashboard/company/booking-requests">Manage existing booking requests</Link>
 </> }</div>;
}
