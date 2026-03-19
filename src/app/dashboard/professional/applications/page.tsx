// src/app/dashboard/professional/applications/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ProfessionalApplicationItem = {
  application_id: number;
  status: string;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  jobpost_id: number;
  job_title?: string | null;
  job_location?: string | null;
  job_profession?: string | null;
  job_day_rate_min?: number | null;
  job_day_rate_max?: number | null;

  company_id?: number | null;
  company_name?: string | null;
};

type StatusFilter =
  | "active"
  | "all"
  | "pending"
  | "shortlisted"
  | "accepted"
  | "rejected";

function norm(v: unknown) {
  return String(v ?? "").toLowerCase().trim();
}

function fmtDate(v?: string | null) {
  if (!v) return "";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return v;
  }
}

function isValidStatusFilter(v: string): v is StatusFilter {
  return ["active", "all", "pending", "shortlisted", "accepted", "rejected"].includes(v);
}

function getInitialStatusFromUrl(): StatusFilter {
  if (typeof window === "undefined") return "active";
  const qp = new URLSearchParams(window.location.search).get("status");
  return qp && isValidStatusFilter(qp) ? qp : "active";
}

export default function ProfessionalApplicationsPage() {
  const [apps, setApps] = useState<ProfessionalApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/professional/applications", { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) {
        setError(text || `STATUS ${res.status}`);
        setApps([]);
        return;
      }

      const data = text ? JSON.parse(text) : [];
      setApps(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Failed to load applications");
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStatus(getInitialStatusFromUrl());
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = norm(query);

    return apps
      .filter((a) => {
        const s = norm(a.status);

        if (status === "all") return true;
        if (status === "active") return s !== "rejected" && s !== "withdrawn" && s !== "closed";
        return s === status;
      })
      .filter((a) => {
        if (!q) return true;
        const hay = [
          a.job_title,
          a.job_location,
          a.job_profession,
          a.company_name,
          a.status,
          a.notes,
        ]
          .map(norm)
          .join(" ");
        return hay.includes(q);
      });
  }, [apps, query, status]);

  const counts = useMemo(() => {
    const pending = apps.filter((a) => norm(a.status) === "pending").length;
    const shortlisted = apps.filter((a) => norm(a.status) === "shortlisted").length;
    const accepted = apps.filter((a) => norm(a.status) === "accepted").length;
    const rejected = apps.filter((a) => norm(a.status) === "rejected").length;

    return { pending, shortlisted, accepted, rejected };
  }, [apps]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My applications</h1>
          <p className="mt-1 text-sm text-neutral-400">Track what you’ve applied for.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/professional"
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
          >
            ← Back
          </Link>

          <Link
            href="/dashboard/marketplace/jobs"
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
          >
            Browse jobs →
          </Link>

          <button
            type="button"
            onClick={load}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
          >
            Refresh
          </button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/professional/applications?status=pending"
          className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-4 transition hover:bg-neutral-900/70"
        >
          <div className="text-xs uppercase tracking-wide text-neutral-400">In review</div>
          <div className="mt-2 text-2xl font-semibold text-purple-300">{counts.pending}</div>
        </Link>

        <Link
          href="/dashboard/professional/applications?status=shortlisted"
          className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-4 transition hover:bg-neutral-900/70"
        >
          <div className="text-xs uppercase tracking-wide text-neutral-400">Shortlisted</div>
          <div className="mt-2 text-2xl font-semibold text-amber-300">{counts.shortlisted}</div>
        </Link>

        <Link
          href="/dashboard/professional/applications?status=accepted"
          className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-4 transition hover:bg-neutral-900/70"
        >
          <div className="text-xs uppercase tracking-wide text-neutral-400">Accepted</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-300">{counts.accepted}</div>
        </Link>

        <Link
          href="/dashboard/professional/applications?status=rejected"
          className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-4 transition hover:bg-neutral-900/70"
        >
          <div className="text-xs uppercase tracking-wide text-neutral-400">Rejected</div>
          <div className="mt-2 text-2xl font-semibold text-red-300">{counts.rejected}</div>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search job title, location, company, status…"
          className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
        />

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
          >
            <option value="active">Active</option>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          Loading…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {filtered.map((a) => {
            const min = a.job_day_rate_min;
            const max = a.job_day_rate_max;

            return (
              <div
                key={a.application_id}
                className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-neutral-100">
                        {a.job_title || `Job #${a.jobpost_id}`}
                      </div>

                      <StatusPill status={a.status} />
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-400">
                      {a.company_name && <span>{a.company_name}</span>}
                      {a.job_location && <span>· {a.job_location}</span>}
                      {a.job_profession && <span>· {a.job_profession}</span>}
                      {min != null && max != null && <span>· £{min}–£{max}/day</span>}
                      {a.created_at && <span>· Applied: {fmtDate(a.created_at)}</span>}
                    </div>

                    {a.notes && (
                      <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950/50 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-wide text-neutral-500">
                          Update
                        </div>
                        <p className="mt-1 whitespace-pre-line text-xs text-neutral-300">
                          {a.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-right text-xs text-neutral-500">
                    <div>App #{a.application_id}</div>
                    <div>Job #{a.jobpost_id}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
              No applications found for this filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status?: string | null }) {
  const s = norm(status || "unknown");

  const cls =
    s === "pending"
      ? "border-purple-500/60 bg-purple-950/40 text-purple-100"
      : s === "shortlisted"
        ? "border-amber-500/60 bg-amber-950/40 text-amber-100"
        : s === "accepted"
          ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-100"
          : s === "rejected"
            ? "border-red-500/60 bg-red-950/40 text-red-100"
            : "border-neutral-600/70 bg-neutral-900/70 text-neutral-100";

  return <span className={`rounded-full border px-2 py-0.5 text-[11px] ${cls}`}>{s}</span>;
}