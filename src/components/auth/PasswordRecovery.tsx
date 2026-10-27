"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthShell from "./AuthShell";
import styles from "./auth.module.css";
export default function PasswordRecovery({ reset = false }: { reset?: boolean }) {
 const query = useSearchParams(); const token = query.get("token");
 const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
 const [confirm, setConfirm] = useState(""); const [busy, setBusy] = useState(false);
 const [error, setError] = useState(""); const [done, setDone] = useState(false);
 async function submit(e: React.FormEvent) {
  e.preventDefault(); if (busy) return;
  if (reset && password !== confirm) { setError("The passwords do not match."); return; }
  setBusy(true); setError("");
  try {
   const response = await fetch(`/api/auth/${reset ? "reset-password" : "forgot-password"}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(reset ? { token, password } : { email }), signal:AbortSignal.timeout(25000) });
   if (!response.ok) throw new Error(reset ? "This link may have expired or already been used. Request a new reset link." : "We couldn’t request a reset email. Please try again shortly.");
   setDone(true);
  } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); } finally { setBusy(false); }
 }
 return <AuthShell><h2 className={styles.heading}>{reset ? "Choose a new password." : "Forgot your password?"}</h2>
 <p className={styles.intro}>{reset ? "Use at least 12 characters for your new password." : "Enter your account email to request a reset link."}</p>
 {error && <p role="alert" className={`${styles.notice} ${styles.error}`}>{error}</p>}
 {done ? <p role="status" className={`${styles.notice} ${styles.success}`}>{reset ? "Password updated. You can now sign in." : "If this email belongs to an eligible account, a reset email has been requested. Check your inbox and junk folder."}</p> : reset && !token ? <p role="alert">This link is missing its code. <Link href="/forgot-password">Request a new link</Link>.</p> : <form onSubmit={submit} className={styles.form}>
 {reset ? <><label className={styles.field}>New password<input className={styles.input} type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} /></label><label className={styles.field}>Confirm new password<input className={styles.input} type="password" autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)} /></label></> : <label className={styles.field}>Email address<input className={styles.input} type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label>}
 <button className={styles.primary} disabled={busy}>{busy ? "Please wait…" : reset ? "Update password" : "Request reset link"}</button></form>}
 <p className={styles.footnote}><Link href="/login">Back to sign in</Link>{reset && <> · <Link href="/forgot-password">Request a new link</Link></>}</p></AuthShell>;
}
