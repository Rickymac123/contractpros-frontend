"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Job = {
  id: number;
  title: string;
  location?: string | null;
  profession?: string | null;
  day_rate_min?: number | null;
  day_rate_max?: number | null;
  is_archived?: boolean | null;
  company_id?: string | number | null;
};

type AdminUser = {
  id: string | number;
  email: string;
  company_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

function extractDetail(text: string, status: number) {
  if (!text) return `STATUS ${status}: EMPTY`;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && "detail" in parsed) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detail = (parsed as any).detail;
      return typeof detail === "string" ? detail : JSON.stringify(detail);
    }
  } catch {}
  return `STATUS ${status}: ${text}`;
}

function norm(v: unknown) {
  return String(v ?? "").toLowerCase().trim();
}

export default function AdminJobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Company lookup (id -> label)
  const [companyLabelById, setCompanyLabelById] = useState<Record<string, string>>(
    {},
  );

  // Search + filter (URL-driven)
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "archived">("all");

  // Sync state FROM URL
  useEffect(() => {
    const urlStatus = (searchParams.get("status") ?? "all") as
      | "all"
      | "active"
      | "archived";
    const urlQuery = searchParams.get("q") ?? "";

    if (urlStatus !== status) setStatus(urlStatus);
    if (urlQuery !== query) setQuery(urlQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setUrlParams = (next: { status?: string; q?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (next.status !== undefined) {
      if (next.status === "all") params.delete("status");
      else params.set("status", next.status);
    }

    if (next.q !== undefined) {
      const v = next.q.trim();
      if (!v) params.delete("q");
      else params.set("q", v);
    }

    const qs = params.toString();
    router.replace(qs ? `/dashboard/admin/jobs?${qs}` : "/dashboard/admin/jobs");
  };

  const loadCompanies = async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) return;

      const text = await res.text();
      const data = text ? (JSON.parse(text) as AdminUser[]) : [];
      if (!Array.isArray(data)) return;

      const map: Record<string, string> = {};
      for (const u of data) {
        const id = String(u.id);
        const label =
          (u.company_name && u.company_name.trim()) ||
          (u.first_name || u.last_name
            ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
            : "") ||
          u.email ||
          `Company #${id}`;

        map[id] = label;
      }
      setCompanyLabelById(map);
    } catch {
      // ignore
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    setOk(null);

    try {
      const res = await fetch("/api/admin/jobs", { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) {
        setError(text || `STATUS ${res.status}`);
        return;
      }

      const data = text ? JSON.parse(text) : [];
      setJobs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const load = async () => {
    await Promise.all([loadCompanies(), loadJobs()]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleArchive = async (job: Job) => {
    const next = !(job.is_archived ?? false);
    const label = next ? "Archive" : "Unarchive";

    const confirmed = window.confirm(`${label} this job?\n\n${job.title}`);
    if (!confirmed) return;

    setBusyId(job.id);
    setError(null);
    setOk(null);

    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_archived: next }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(extractDetail(text, res.status));

      setOk(next ? "Job archived." : "Job unarchived.");
      await loadJobs();
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Failed to update job");
    } finally {
      setBusyId(null);
    }
  };

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

        const companyId = j.company_id == null ? "" : String(j.company_id);
        const companyLabel = companyLabelById[companyId] ?? "";

        const haystack = [j.title, j.location, j.profession, companyLabel]
          .map(norm)
          .join(" ");

        return haystack.includes(q);
      });
  }, [jobs, query, status, companyLabelById]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin · Jobs</h1>
        <p className="text-sm text-neutral-400">All jobs across all companies.</p>
      </header>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <input
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              setUrlParams({ q: v });
            }}
            placeholder="Search title, location, profession, company…"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              const v = e.target.value as any;
              setStatus(v);
              setUrlParams({ status: v });
            }}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <button
            type="button"
            onClick={load}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 transition hover:bg-neutral-900"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-neutral-400">Loading…</p>}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {!loading && ok && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
          {ok}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {filtered.map((j) => {
            const archived = j.is_archived ?? false;
            const busy = busyId === j.id;

            const companyId = j.company_id == null ? "" : String(j.company_id);
            const companyLabel =
              companyLabelById[companyId] || `Company #${companyId || "—"}`;

            return (
              <div
                key={j.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-neutral-100">
                        {j.title}
                      </div>
                      {archived && (
                        <span className="rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[11px] text-neutral-200">
                          Archived
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-400">
                      <span className="text-neutral-300">{companyLabel}</span>
                      {j.location && <span>· {j.location}</span>}
                      {j.profession && <span>· {j.profession}</span>}
                      {j.day_rate_min != null && j.day_rate_max != null && (
                        <span>· £{j.day_rate_min}–£{j.day_rate_max}/day</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-neutral-500">Job #{j.id}</div>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggleArchive(j)}
                      className="rounded-lg border border-neutral-700 bg-neutral-900/70 px-2.5 py-1 text-xs text-neutral-200 transition hover:bg-neutral-800 disabled:opacity-60"
                      title={archived ? "Unarchive job" : "Archive job"}
                    >
                      {busy ? "Working…" : archived ? "Unarchive" : "Archive"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-10 text-center text-sm text-neutral-400">
              No jobs match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}