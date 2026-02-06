"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Job = {
  id: number;
  title: string;
  location?: string | null;
  profession?: string | null;
  day_rate_min?: number | null;
  day_rate_max?: number | null;
  description?: string | null;
  is_archived?: boolean | null;
  company_id?: string | number | null;
};

type MyApplication = {
  id?: number;
  jobpost_id?: number;
  job_id?: number; // tolerate alternative shapes
};

type Me = {
  role?: string | null;
  is_superuser?: boolean | null;
};

function norm(v: unknown) {
  return String(v ?? "").toLowerCase().trim();
}

function homeFor(me: Me | null) {
  if (me?.is_superuser) return "/dashboard/admin";
  const r = (me?.role ?? "").toLowerCase();
  if (r === "admin") return "/dashboard/admin";
  if (r === "agency") return "/dashboard/agency";
  if (r === "professional") return "/dashboard/professional";
  return "/dashboard/company";
}

export default function MarketplaceJobsPage() {
  const router = useRouter();

  const [me, setMe] = useState<Me | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"active" | "all" | "archived">("active");

  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());

  const loadMe = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Me;
      setMe(data);
    } catch {
      // ignore
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/marketplace/jobs", { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) {
        setError(text || `STATUS ${res.status}`);
        setJobs([]);
        return;
      }

      const data = text ? JSON.parse(text) : [];
      setJobs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyApplications = async () => {
    try {
      const res = await fetch("/api/professional/applications", { cache: "no-store" });
      if (!res.ok) return; // not logged in / not professional etc.

      const data = (await res.json()) as MyApplication[];
      const ids = new Set<number>();

      for (const a of Array.isArray(data) ? data : []) {
        const raw = (a as any)?.jobpost_id ?? (a as any)?.job_id;
        const id = Number(raw);
        if (!Number.isNaN(id)) ids.add(id);
      }

      setAppliedJobIds(ids);
    } catch {
      // ignore - page still works without it
    }
  };

  useEffect(() => {
    loadMe();
    loadJobs();
    loadMyApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backHref = useMemo(() => homeFor(me), [me]);

  const filtered = useMemo(() => {
    const q = norm(query);

    return jobs
      .filter((j) => {
        const archived = j.is_archived ?? false;
        if (status === "active" && archived) return false;
        if (status === "archived" && !archived) return false;
        return true;
      })
      .filter((j) => {
        if (!q) return true;
        const hay = [j.title, j.location, j.profession].map(norm).join(" ");
        return hay.includes(q);
      });
  }, [jobs, query, status]);

  const handleApply = async (jobId: number) => {
    if (!jobId || Number.isNaN(Number(jobId))) return;

    // UX guard
    if (appliedJobIds.has(jobId)) return;
    if (applyingId === jobId) return;

    setApplyingId(jobId);

    try {
      const res = await fetch(`/api/marketplace/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ notes: "" }),
      });

      const text = await res.text();

      if (!res.ok) {
        // If backend already has it, mark applied anyway
        if (text && text.toLowerCase().includes("application already exists")) {
          setAppliedJobIds((prev) => new Set(prev).add(jobId));
          return;
        }

        let detail = text || `APPLY_STATUS_${res.status}`;
        try {
          const parsed = text ? JSON.parse(text) : null;
          if (parsed && typeof parsed === "object" && "detail" in parsed) {
            detail = (parsed as any).detail ?? detail;
          }
        } catch {}

        alert(detail);
        return;
      }

      // Success
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
    } finally {
      setApplyingId(null);
    }
  };

  const backToDashboard = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(backHref);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Marketplace · Jobs</h1>
          <p className="mt-1 text-sm text-neutral-400">Browse jobs and apply.</p>
        </div>

        <Link
          href={backHref}
          onClick={backToDashboard}
          className="rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-1.5 text-xs text-neutral-200 transition hover:bg-neutral-800"
        >
          ← Back
        </Link>
      </header>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, location, profession…"
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
            <option value="archived">Archived</option>
          </select>

          <button
            type="button"
            onClick={() => {
              loadJobs();
              loadMyApplications();
            }}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 transition hover:bg-neutral-900"
          >
            Refresh
          </button>
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
          {filtered.map((j) => {
            const archived = j.is_archived ?? false;
            const alreadyApplied = appliedJobIds.has(j.id);
            const isApplying = applyingId === j.id;

            return (
              <div
                key={j.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-neutral-100">{j.title}</div>
                      {archived && (
                        <span className="rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[11px] text-neutral-200">
                          Archived
                        </span>
                      )}
                      {alreadyApplied && (
                        <span className="rounded-full border border-purple-500/40 bg-purple-950/30 px-2 py-0.5 text-[11px] text-purple-200">
                          Applied
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-400">
                      {j.location && <span>{j.location}</span>}
                      {j.profession && <span>· {j.profession}</span>}
                      {j.day_rate_min != null && j.day_rate_max != null && (
                        <span>· £{j.day_rate_min}–£{j.day_rate_max}/day</span>
                      )}
                    </div>

                    {j.description && (
                      <p className="mt-2 text-xs text-neutral-500 line-clamp-2">
                        {j.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right text-xs text-neutral-500">
                      <div>Job #{j.id}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApply(j.id)}
                      disabled={archived || alreadyApplied || isApplying}
                      className={
                        archived || alreadyApplied
                          ? "rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-xs text-neutral-500 cursor-not-allowed"
                          : "rounded-xl border border-purple-500/70 bg-purple-700/30 px-3 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:opacity-60"
                      }
                    >
                      {archived
                        ? "Archived"
                        : alreadyApplied
                          ? "Applied"
                          : isApplying
                            ? "Applying…"
                            : "Apply"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
              No jobs match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}