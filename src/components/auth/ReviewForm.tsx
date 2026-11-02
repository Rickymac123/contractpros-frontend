"use client";
import {useState} from "react";
import {useSearchParams} from "next/navigation";
import Link from "next/link";
import AuthShell from "./AuthShell";
import styles from "./auth.module.css";
export default function ReviewForm({verify=false}:{verify?:boolean}) {
 const token=useSearchParams().get("token"); const [busy,setBusy]=useState(false); const [done,setDone]=useState(""); const [error,setError]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>) {
  e.preventDefault(); if(busy)return; setBusy(true);setError("");
  const form=new FormData(e.currentTarget);
  const body=verify ? {token} : {invite_token:token,reviewer_name:form.get("name"),reviewer_email:form.get("email"),reviewer_company:form.get("company"),reviewer_role:form.get("role"),rating:Number(form.get("rating")),title:form.get("title"),comment:form.get("comment"),is_public:form.get("public")==="on"};
  try {
   const response=await fetch(`/api/public/reviews/${verify ? "verify" : "submit"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:AbortSignal.timeout(25000)});
   const data=await response.json();
   if(!response.ok) { const messages:Record<string,string>={INVALID_INVITE:"This invitation is invalid.",INVITE_EXPIRED:"This invitation has expired. Ask the professional for a new link.",INVITE_ALREADY_USED:"This invitation has already been used.",INVALID_TOKEN:"This confirmation link is invalid.",TOKEN_EXPIRED:"This confirmation link has expired.",TOKEN_ALREADY_USED:"This review has already been confirmed."}; throw new Error(messages[data.detail] || "We couldn’t save your review. Please check the fields and try again."); }
   setDone(verify ? "Your review is confirmed. Thank you for sharing your experience." : data.email_sent ? "Review saved. Check your email and confirm your review before it appears on the profile." : "Your review was saved, but the confirmation email could not be sent. Please contact ContractPros support; do not submit another review.");
  }catch(e){setError(e instanceof Error ? e.message : "Please try again.");}finally{setBusy(false);}
 }
 return <AuthShell><h2 className={styles.heading}>{verify?"Confirm your review.":"Share your experience."}</h2><p className={styles.intro}>{verify?"Confirm only if you wrote this review.":"Tell us about your experience working with this professional. Your email address is not shown publicly."}</p>
 {error&&<p role="alert" className={`${styles.notice} ${styles.error}`}>{error}</p>}
 {done?<p role="status" className={styles.notice}>{done}</p>:!token?<p role="alert">This link is missing its code. Please use the full link you received.</p>:<form onSubmit={submit} className={styles.form}>
 {!verify&&<>{[["name","Your name","text",true],["email","Email address","email",true],["company","Company (optional)","text",false],["role","Your role (optional)","text",false],["title","Review title (optional)","text",false]].map(([name,label,type,required])=><label className={styles.field} key={String(name)}>{label}<input className={styles.input} name={String(name)} type={String(type)} required={Boolean(required)} maxLength={200}/></label>)}
 <label className={styles.field}>Rating<select name="rating" className={styles.input} defaultValue="5">{[5,4,3,2,1].map(n=><option value={n} key={n}>{n} {n===1?"star":"stars"}</option>)}</select></label>
 <label className={styles.field}>Your review<textarea className={styles.input} name="comment" required minLength={50} maxLength={5000} rows={5}/><span className={styles.hint}>At least 50 characters. Please avoid confidential or personal details.</span></label>
 <label className={styles.hint}><input name="public" type="checkbox" defaultChecked/> Display my review, name and company on the professional’s profile after I confirm it.</label><p className={styles.hint}>Read our <Link href="/privacy">privacy notice</Link>.</p></>}
 <button className={styles.primary} disabled={busy}>{busy?"Please wait…":verify?"Confirm my review":"Submit review"}</button></form>}
 <p className={styles.footnote}><Link href="/">Back to ContractPros</Link></p></AuthShell>;
}
