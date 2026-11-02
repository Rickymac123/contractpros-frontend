"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Talent = { id: number; first_name: string; last_name: string };
type Job = { id: number; title: string; location?: string; description?: string };
type Application = { application_id: number; talent_id: number; talent_name: string; jobpost_id: number; job_title: string; status: string; notes?: string };

async function read<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 401 ? "Your session has expired. Please sign in again." : "We could not load this information. Please retry.");
  return response.json();
}

export default function AgencyApplicationsPage() {
  const [talent, setTalent] = useState<Talent[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const [people, vacancies, submissions] = await Promise.all([
        read<Talent[]>("/api/agency/talent"), read<Job[]>("/api/marketplace/jobs"), read<Application[]>("/api/agency/applications"),
      ]);
      setTalent(people); setJobs(vacancies); setApplications(submissions);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load applications."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function act(url: string, body: object, method: string, success: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(typeof data.detail === "string" ? data.detail : "We could not save this change. Please retry.");
      }
      setMessage(success); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save this change."); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <header><h1 className="text-2xl font-semibold">Agency applications</h1><p className="mt-2 text-neutral-400">Submit a professional you represent and track the company’s response.</p></header>
    {error && <div role="alert" className="rounded-xl border border-red-700 p-4">{error} <button onClick={() => void load()} className="underline">Retry</button> <Link href="/login" className="underline">Sign in</Link></div>}
    {message && <p role="status" className="text-emerald-300">{message}</p>}
    {loading ? <p role="status">Loading applications…</p> : <>
      <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <h2 className="text-xl font-semibold">Find a role for your professional</h2>
        {!talent.length ? <p>Add a professional before submitting an application. <Link href="/dashboard/agency/talent/new" className="text-purple-300 underline">Add professional</Link></p> : <>
          <label className="block">Professional<select value={selected} onChange={e => setSelected(e.target.value)} className="mt-2 block w-full rounded-lg border border-neutral-700 bg-black p-3"><option value="">Select a professional</option>{talent.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}</select></label>
          <label className="block">Search jobs<input value={query} onChange={e => setQuery(e.target.value)} className="mt-2 block w-full rounded-lg border border-neutral-700 bg-black p-3" /></label>
          {!jobs.length && <p>No open jobs yet. Your professional profiles are saved; check back for new opportunities.</p>}
          {jobs.length > 0 && !jobs.some(j => `${j.title} ${j.location || ""}`.toLowerCase().includes(query.toLowerCase())) && <p>No jobs match your search. Try a different title or location.</p>}
          {jobs.filter(j => `${j.title} ${j.location || ""}`.toLowerCase().includes(query.toLowerCase())).map(j => {
            const existing = applications.find(a => a.jobpost_id === j.id && a.talent_id === Number(selected));
            return <article key={j.id} className="space-y-2 rounded-xl border border-neutral-800 p-4"><h3 className="font-semibold">{j.title}</h3><p>{j.location}</p><p className="whitespace-pre-wrap text-sm text-neutral-400">{j.description}</p>
              <button disabled={!selected || busy || !!existing} onClick={() => void act(`/api/marketplace/jobs/${j.id}/apply`, { talent_id: Number(selected) }, "POST", "Application submitted. You can track it below.")} className="rounded-lg bg-purple-600 px-4 py-2 disabled:opacity-50">{existing ? `Application ${existing.status}` : "Submit selected professional"}</button></article>;
          })}
        </>}
      </section>
      <section className="space-y-4"><h2 className="text-xl font-semibold">Submitted applications</h2>
        {!applications.length && <p>No applications yet. Choose a professional and an open job above to get started.</p>}
        {applications.map(a => <article key={a.application_id} className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4"><h3 className="font-semibold">{a.talent_name} · {a.job_title}</h3><p className="capitalize">{a.status}</p>{a.notes && <p className="whitespace-pre-wrap text-neutral-400">{a.notes}</p>}
          {["pending", "shortlisted"].includes(a.status) && <button disabled={busy} className="rounded-lg border border-neutral-600 px-4 py-2 disabled:opacity-50" onClick={() => void act(`/api/applications/${a.application_id}`, { status: "withdrawn" }, "PATCH", "Application withdrawn.")}>Withdraw application</button>}
        </article>)}
      </section>
    </>}
  </div>;
}
