"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AuthShell from "./AuthShell";
import SocialButtons from "./SocialButtons";
import styles from "./auth.module.css";
import { authError } from "@/lib/auth-errors";

type Role = "professional" | "company" | "agency";
export default function SignupForm({ initialRole = "professional" }: { initialRole?: Role }) {
  const query = useSearchParams();
  const [role, setRole] = useState<Role>(["professional", "company", "agency"].includes(query.get("role") || "") ? query.get("role") as Role : initialRole);
  const [step, setStep] = useState(1);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [social, setSocial] = useState(false);
  const [checking, setChecking] = useState(query.get("social") === "1");
  const [data, setData] = useState({ first_name: "", last_name: "", email: "", password: "", phone: "", address_line1: "", address_line2: "", city: "", postcode: "", country: "United Kingdom", company_name: "", profession_category: "engineering", profession: "" });
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (query.get("social") !== "1") { const code = query.get("error"); if (code) setError(authError(code)); return; }
    fetch("/api/social/pending", { cache: "no-store" }).then(async r => {
      if (!r.ok) throw new Error("SOCIAL_EXPIRED");
      const identity = await r.json();
      setData(d => ({ ...d, email: identity.email })); setSocial(true);
    }).catch(() => setError(authError("SOCIAL_EXPIRED"))).finally(() => setChecking(false));
  }, [query]);
  function field(name: keyof typeof data, label: string, autoComplete: string, type = "text", required = true) {
    return <label className={styles.field} htmlFor={name}>{label}<input id={name} name={name} autoComplete={autoComplete} type={type} required={required} maxLength={name === "email" ? 254 : 200} className={styles.input} value={data[name]} onChange={e => setData({ ...data, [name]: e.target.value })} /></label>;
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    if (step === 1) { setStep(2); requestAnimationFrame(() => heading.current?.focus()); return; }
    if (busy) return;
    setBusy(true);
    const { password, ...profile } = data;
    try {
      const response = await fetch(social ? "/api/social/complete" : "/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, email: data.email.trim(), role, location: data.city.trim(), ...(social ? {} : { password }) }), signal: AbortSignal.timeout(20000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) { setError(authError(result?.detail)); return; }
      if (result?.status === "verification_required") { setDone(true); return; }
      if (social) { window.location.assign(`/dashboard/${role}`); return; }
      setDone(true);
    } catch { setError("We couldn’t confirm your signup. Check your connection and try signing in before retrying."); }
    finally { setBusy(false); }
  }
  return <AuthShell>
    <p className={styles.topline}>Already a member? <Link href="/login">Sign in</Link></p>
    {done ? <>
      <h2 className={styles.heading}>Check your inbox</h2>
      <p className={styles.intro}>Your account has been created. Use the verification link sent to <strong>{data.email}</strong> before signing in.</p>
      <div className={`${styles.notice} ${styles.success}`} role="status">Check your junk folder too. You can request another link from the sign-in page.</div>
      <Link href="/login?created=1" className={styles.primary} style={{ display: "block", textAlign: "center", textDecoration: "none" }}>Continue to sign in →</Link>
    </> : <>
      <p className={styles.eyebrow} style={{ color: "#d8b4fe", marginBottom: 12 }}>STEP {step} OF 2 · {step === 1 ? "YOUR ACCOUNT" : "YOUR DETAILS"}</p>
      <h2 className={styles.heading} ref={heading} tabIndex={-1}>{step === 1 ? (social ? "Finish creating your account" : "Let’s get you connected.") : "A little more about you."}</h2>
      <p className={styles.intro}>{step === 1 ? "Choose how you’ll use ContractPros. Your profile comes next." : "These details help set up your account. You can add more to your profile later."}</p>
      {error && <div role="alert" className={`${styles.notice} ${styles.error}`}>{error}</div>}
      {checking ? <p className={styles.spinner} role="status">Checking your sign-in…</p> : <form onSubmit={submit} className={styles.form}>
        <div hidden={step !== 1}>
          <fieldset className={styles.roles} disabled={busy}><legend>I’m joining as a</legend>
            {([['professional','Professional','Find work'],['company','Company','Find talent'],['agency','Agency','Manage talent']] as const).map(([value,title,subtitle]) => <label key={value} className={styles.role}><input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} /><strong>{title}</strong><small>{subtitle}</small></label>)}
          </fieldset>
          {!social && <SocialButtons role={role} />}
        </div>
        {step === 1 ? <>
          <div className={styles.row}>{field("first_name", "First name", "given-name")}{field("last_name", "Last name", "family-name")}</div>
          {social ? <div className={styles.notice}>Signed in with <strong>{data.email}</strong>. Complete your details to create your ContractPros account.</div> : <>
            {field("email", "Email address", "email", "email")}
            <label htmlFor="password" className={styles.field}>Password<div className={styles.password}><input id="password" aria-label="Password" autoComplete="new-password" className={styles.input} type={show ? "text" : "password"} value={data.password} required minLength={12} maxLength={128} aria-describedby="password-hint" onChange={e => setData({ ...data, password: e.target.value })} /><button type="button" className={styles.show} aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button></div><span className={styles.hint} id="password-hint">Use at least 12 characters. A few unrelated words work well.</span></label>
          </>}
        </> : <>
          <button type="button" className={styles.back} style={{ textAlign: "left", border: 0, background: "none", marginBottom: 0 }} onClick={() => { setStep(1); setError(""); }}>← Back to account details</button>
          {role === "professional" ? <div className={styles.row}><label className={styles.field}>Professional area<select className={styles.input} value={data.profession_category} onChange={e => setData({ ...data, profession_category: e.target.value })}>{['engineering','operations','quality','technical','maintenance','project_management','other'].map(x => <option key={x} value={x}>{x.replace('_',' ').replace(/^./,c => c.toUpperCase())}</option>)}</select></label>{field("profession", "Job title / profession", "organization-title")}</div> : field("company_name", role === "agency" ? "Agency name" : "Company name", "organization")}
          {field("phone", "Phone number", "tel", "tel")}
          {field("address_line1", "Address line 1", "address-line1")}
          {field("address_line2", "Address line 2 (optional)", "address-line2", "text", false)}
          <div className={styles.row}>{field("city", "Town / city", "address-level2")}{field("postcode", "Postcode", "postal-code")}</div>
          {field("country", "Country", "country-name")}
        </>}
        <button className={styles.primary} disabled={busy} type="submit">{busy ? "Creating your account…" : step === 1 ? "Continue →" : "Create account →"}</button>
      </form>}
      <p className={styles.footnote}>{social ? "Your provider password is never shared with ContractPros." : "We’ll send you an email to verify your account."}</p>
    </>}
  </AuthShell>;
}
