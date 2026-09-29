"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import SocialButtons from "@/components/auth/SocialButtons";
import styles from "@/components/auth/auth.module.css";
import { authError } from "@/lib/auth-errors";

export default function LoginClient() {
  const query = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resending, setResending] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (busy) return; setBusy(true); setError(""); setInfo("");
    try {
      const response = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), password }), signal: AbortSignal.timeout(20000) });
      const body = await response.json();
      if (!response.ok) { setError(authError(body.detail)); return; }
      const role = body.user?.role;
      if (!["professional", "company", "agency", "admin"].includes(role)) { setError("We couldn’t open your dashboard. Please contact ContractPros support."); return; }
      window.location.assign(`/dashboard/${role}`);
    } catch { setError("We couldn’t connect. Please try again in a moment."); }
    finally { setBusy(false); }
  }
  async function resend() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter your email address above to request a verification link."); return; }
    setResending(true); setError("");
    try {
      const response = await fetch("/api/auth/request-verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }), signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error();
      setInfo("If this account needs verification, we’ve requested a new email. Check your inbox and junk folder.");
    } catch { setError("We couldn’t request the email. Please try again shortly."); }
    finally { setResending(false); }
  }
  return <AuthShell>
    <p className={styles.topline}>New to ContractPros? <Link href="/register">Create an account</Link></p>
    <p className={styles.eyebrow} style={{ color: "#d8b4fe" }}>YOUR NEXT OPPORTUNITY AWAITS</p>
    <h2 className={styles.heading}>Welcome back.</h2>
    <p className={styles.intro}>Sign in to pick up where you left off.</p>
    {(info || query.get("created") === "1") && <div role="status" className={`${styles.notice} ${styles.success}`}>{info || "Account created. Check your email for the verification link before signing in."}</div>}
    {(error || query.get("error")) && <div role="alert" className={`${styles.notice} ${styles.error}`}>{error || authError(query.get("error"))}</div>}
    <SocialButtons />
    <form onSubmit={submit} className={styles.form}>
      <label className={styles.field} htmlFor="email">Email address<input className={styles.input} id="email" autoComplete="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className={styles.field} htmlFor="password">Password<div className={styles.password}><input className={styles.input} id="password" aria-label="Password" autoComplete="current-password" type={show ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} /><button className={styles.show} type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button></div></label>
      <button className={styles.primary} disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in →"}</button>
    </form>
    <p className={styles.footnote}>Still waiting for your verification email? <button type="button" className={styles.link} disabled={resending} onClick={resend}>{resending ? "Requesting…" : "Send another link"}</button></p>
  </AuthShell>;
}
