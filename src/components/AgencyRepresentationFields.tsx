"use client";
export type RepresentationEvidence = {authority_confirmed: boolean; privacy_notice_confirmed: boolean; notice_provided_on: string; notice_delivery_method: string};
export const emptyRepresentation: RepresentationEvidence = {authority_confirmed:false,privacy_notice_confirmed:false,notice_provided_on:"",notice_delivery_method:"email"};
export default function AgencyRepresentationFields({value,onChange}:{value:RepresentationEvidence;onChange:(value:RepresentationEvidence)=>void}) {
 const set = (key: keyof RepresentationEvidence, entry: string | boolean) => onChange({...value,[key]:entry});
 return <fieldset className="space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-slate-800">
  <legend className="px-1 font-semibold">Representation and privacy notice</legend>
  <p>Give the professional the <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">ContractPros privacy notice</a> before adding their information. Keep your evidence of authority and delivery securely. This records your confirmation; it is not the professional’s consent to unrelated uses.</p>
  <label className="flex items-start gap-2"><input type="checkbox" required checked={value.authority_confirmed} onChange={e=>set('authority_confirmed',e.target.checked)}/>I have current authority to represent this professional and share their details with recruiting companies.</label>
  <label className="flex items-start gap-2"><input type="checkbox" required checked={value.privacy_notice_confirmed} onChange={e=>set('privacy_notice_confirmed',e.target.checked)}/>The professional has received the ContractPros privacy notice and knows how their information will be used.</label>
  <label className="block">Date the notice was provided<input type="date" required value={value.notice_provided_on} onInput={e=>set('notice_provided_on',e.currentTarget.value)} onChange={e=>set('notice_provided_on',e.target.value)} className="mt-1 block rounded border p-2"/></label>
  <label className="block">How the notice was provided<select required value={value.notice_delivery_method} onChange={e=>set('notice_delivery_method',e.target.value)} className="mt-1 block rounded border p-2"><option value="email">Email</option><option value="in_person">In person</option><option value="portal">Professional portal</option><option value="post">Post</option></select></label>
 </fieldset>;
}
