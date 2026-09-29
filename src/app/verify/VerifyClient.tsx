"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import styles from "@/components/auth/auth.module.css";

export default function VerifyClient() {
  const token = useSearchParams().get("token") ?? "";
  const started = useRef<string | null>(null);
  const [status, setStatus] = useState("working");
  const [message, setMessage] = useState("Checking your verification link…");
  useEffect(() => {
    if (started.current === token) return;
    started.current = token;
    if (!token) { setStatus("fail"); setMessage("This link is missing its verification code. Request a new link from the sign-in page."); return; }
    async function verify() {
      try {
        const response = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }), signal: AbortSignal.timeout(15000) });
        const result = await response.json().catch(() => null);
        if (started.current !== token) return;
        if (response.ok || result?.detail === "VERIFY_USER_ALREADY_VERIFIED") { setStatus("ok"); setMessage("Your email is verified. You can now sign in to ContractPros."); }
        else { setStatus("fail"); setMessage("This link is invalid or has expired. If you’ve already verified your email, sign in. Otherwise, request a new link."); }
      } catch { if (started.current === token) { setStatus("fail"); setMessage("We couldn’t connect. Refresh this page to try again."); } }
    }
    void verify();
  }, [token]);
  return <AuthShell><h2 className={styles.heading}>{status === "ok" ? "You’re ready to connect." : "Verify your email"}</h2><p role={status === "fail" ? "alert" : "status"} className={styles.intro}>{message}</p><Link href="/login" className={styles.primary} style={{ display: "block", textAlign: "center", textDecoration: "none" }}>Continue to sign in →</Link></AuthShell>;
}
