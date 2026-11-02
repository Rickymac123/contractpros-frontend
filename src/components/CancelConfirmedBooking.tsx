'use client';
import {useState} from 'react';
export default function CancelConfirmedBooking({requestId,onCancelled}:{requestId:number;onCancelled:()=>Promise<void>}) {
 const [open,setOpen]=useState(false);const [reason,setReason]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function cancel(){if(busy||!reason.trim())return;setBusy(true);setError('');
 try{const r=await fetch(`/api/bookings/by-request/${requestId}/cancel`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reason:reason.trim()})});
 if(!r.ok)throw new Error('Unable to cancel. Refresh to check the booking status, or contact support.');
 await onCancelled();setOpen(false);
 }catch(e){setError(e instanceof Error?e.message:'Unable to cancel.');}finally{setBusy(false);}}
 return <div className="w-full text-sm">{!open?<button onClick={()=>setOpen(true)} className="rounded-lg border border-red-700 px-3 py-2">Cancel confirmed booking</button>:<div className="space-y-3 rounded-xl border border-red-800 p-4"><p>This cancels the booking and releases the professional’s calendar. The other party will be notified. Any agreed cancellation charges or contractual obligations must be resolved separately.</p><label className="block">Cancellation reason<textarea maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)} className="mt-2 block w-full rounded-lg border border-neutral-600 bg-neutral-950 p-3" /></label><div className="flex gap-3"><button disabled={busy||!reason.trim()} onClick={()=>void cancel()} className="rounded-lg bg-red-800 px-3 py-2 disabled:opacity-50">{busy?'Cancelling…':'Confirm cancellation'}</button><button disabled={busy} onClick={()=>setOpen(false)} className="rounded-lg border border-neutral-600 px-3 py-2">Keep booking</button></div></div>}{error&&<p role="alert" className="mt-2 text-red-300">{error}</p>}</div>;
}
