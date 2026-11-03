"use client";
import {useState} from "react";
import AgencyRepresentationFields,{emptyRepresentation} from "./AgencyRepresentationFields";
export default function AgencyRepresentationRecord({talentId,confirmedAt,providedOn}:{talentId:number;confirmedAt?:string|null;providedOn?:string|null}) {
 const [value,setValue]=useState({...emptyRepresentation});const [saved,setSaved]=useState(confirmedAt);const [date,setDate]=useState(providedOn);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 if(saved) return <section className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm"><h2 className="font-semibold">Representation recorded</h2><p>Agency confirmation recorded {new Date(saved.endsWith('Z')?saved:saved+'Z').toLocaleDateString('en-GB')}. Privacy notice provided {date}. Keep the supporting evidence and contact support if authority is withdrawn.</p></section>;
 return <form className="space-y-3" onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');try {const res=await fetch(`/api/agency/talent?id=${talentId}&action=representation`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});const data=await res.json();if(!res.ok) throw new Error(typeof data.detail==='string'?data.detail:'Check the confirmations and notice date.');setSaved(data.representation_confirmed_at);setDate(data.notice_provided_on);}catch(err){setMessage(err instanceof Error?err.message:'Unable to save. Please retry.');}finally{setBusy(false);}}}>
  <AgencyRepresentationFields value={value} onChange={setValue}/><p role="alert">{message}</p><button disabled={busy} className="rounded-lg bg-purple-600 px-4 py-2 text-white">{busy?'Saving…':'Record representation'}</button>
 </form>;
}
