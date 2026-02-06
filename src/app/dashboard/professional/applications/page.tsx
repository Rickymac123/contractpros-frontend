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

export default function ProfessionalApplicationsPage() {
  const [apps, setApps] = useState<ProfessionalApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"active" | "all">("active");

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
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = norm(query);

    return apps
      .filter((a) => {
        if (status === "all") return true;
        // "active" = everything that isn't a terminal status (tweak as you like)
        const s = norm(a.status);
        return s !== "rejected" && s !== "withdrawn" && s !== "closed";
      })
      .filter((a) => {
        if (!q) return true;
        const hay = [a.job_title, a.job_location, a.job_profession, a.company_name, a.status]
          .map(norm)
          .join(" ");
        return hay.includes(q);
      });
  }, [apps, query, status]);

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

      {/* Controls */}
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
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
          >
            <option value="active">Active</option>
            <option value="all">All</option>
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

                      <span className="rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[11px] text-neutral-200">
                        {a.status || "unknown"}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-400">
                      {a.company_name && <span>{a.company_name}</span>}
                      {a.job_location && <span>· {a.job_location}</span>}
                      {a.job_profession && <span>· {a.job_profession}</span>}
                      {min != null && max != null && <span>· £{min}–£{max}/day</span>}
                      {a.created_at && <span>· Applied: {fmtDate(a.created_at)}</span>}
                    </div>

                    {a.notes && (
                      <p className="mt-2 text-xs text-neutral-500 line-clamp-2">
                        Notes: {a.notes}
                      </p>
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
              No applications yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}