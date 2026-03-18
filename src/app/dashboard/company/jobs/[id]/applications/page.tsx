"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type JobApplication = {
  application_id: number;
  jobpost_id: number;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  talent_id?: number | null;
  talent_name?: string | null;
  talent_profession?: string | null;
  talent_location?: string | null;
  talent_day_rate?: number | null;
  talent_avatar_url?: string | null;

  talent_industry?: string | null;
  talent_engineering_discipline?: string | null;
};

export default function CompanyJobApplicationsPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = typeof params?.id === "string" ? params.id : undefined;

  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (jobId ? `Applications for job #${jobId}` : "Applications"),
    [jobId],
  );

  const load = async (opts?: { silent?: boolean }) => {
    if (!jobId) return;

    try {
      if (opts?.silent) setRefreshing(true);
      else setLoading(true);

      setError(null);

      const res = await fetch(`/api/company/job-applications?job_id=${jobId}`, {
        cache: "no-store",
      });

      const text = await res.text();

      if (!res.ok) {
        setApps([]);
        setError(`STATUS_${res.status}: ${text || "EMPTY"}`);
        return;
      }

      let parsed: unknown = null;
      try {
        parsed = text ? JSON.parse(text) : [];
      } catch {
        setApps([]);
        setError("FAILED_TO_PARSE_RESPONSE_JSON");
        return;
      }

      if (!Array.isArray(parsed)) {
        setApps([]);
        setError("EXPECTED_ARRAY_RESPONSE");
        return;
      }

      const normalized = (parsed as any[]).map((a) => ({
        ...a,
        application_id: typeof a.application_id === "number" ? a.application_id : a.id,
      }));

      setApps(normalized as JobApplication[]);
    } catch (e: any) {
      setApps([]);
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_LOAD_APPLICATIONS");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!jobId) {
      setError("MISSING_JOB_ID");
      setLoading(false);
      return;
    }
    load();
  }, [jobId]);

  const backToJob = () => {
    if (!jobId) return router.push("/dashboard/company/jobs");
    router.push(`/dashboard/company/jobs/${jobId}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="mt-1 text-sm text-neutral-400">{title}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => load({ silent: true })}
            disabled={loading || refreshing}
            className="rounded-xl border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-900 disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>

          <button
            onClick={backToJob}
            className="rounded-xl border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-900"
          >
            ← Back to job
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          Loading applications…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-6 py-4 text-sm text-red-200">
          <p className="font-medium">Failed to load applications</p>
          <p className="mt-1 break-all text-xs text-red-200/80">{error}</p>
        </div>
      )}

      {!loading && !error && apps.length === 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          No applications yet.
        </div>
      )}

      {!loading && !error && apps.length > 0 && (
        <div className="space-y-3">
          {apps.map((a) => {
            const showEngDiscipline =
              (a.talent_profession || "").toLowerCase() === "engineering" &&
              !!a.talent_engineering_discipline?.trim();

            const metaParts = [
              a.talent_profession || "Profession not set",
              a.talent_location || "Location not set",
              a.talent_industry?.trim() ? `Industry: ${a.talent_industry}` : null,
              showEngDiscipline ? `Discipline: ${a.talent_engineering_discipline}` : null,
            ].filter(Boolean) as string[];

            return (
              <div
                key={a.application_id ?? `${a.talent_id}-${a.jobpost_id}-${a.status ?? "na"}`}
                className="rounded-2xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_25px_rgba(0,0,0,0.45)] overflow-hidden"
              >
                <div className="flex items-start gap-4 px-5 py-4">
                  <div className="shrink-0">
                    {a.talent_avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.talent_avatar_url}
                        alt={a.talent_name ?? "Talent"}
                        className="h-12 w-12 rounded-xl border border-neutral-800 object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl border border-purple-500/40 bg-purple-950/30 flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-200">
                          {initials(a.talent_name)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {a.talent_name || `Talent #${a.talent_id ?? "?"}`}
                        </p>

                        <p className="mt-0.5 text-xs text-neutral-400">
                          {metaParts.join(" · ")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusPill status={a.status} />

                        <Link
                          href={`/dashboard/company/applications/${a.application_id}`}
                          className="rounded-lg border border-purple-500/40 bg-purple-950/30 px-2 py-1 text-[11px] font-medium text-purple-200 transition hover:bg-purple-900/40"
                        >
                          View profile
                        </Link>

                        <span className="text-[11px] text-neutral-500">
                          App #{a.application_id}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <InfoBox
                        label="Day rate"
                        value={
                          typeof a.talent_day_rate === "number" ? `£${a.talent_day_rate}` : "Not set"
                        }
                      />
                      <InfoBox label="Applied" value={formatDate(a.created_at) || "—"} />
                      <InfoBox label="Updated" value={formatDate(a.updated_at) || "—"} />
                    </div>

                    <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                        Notes
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm text-neutral-200">
                        {a.notes?.trim() ? a.notes : "No notes provided."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-800/70 px-5 py-3 text-xs text-neutral-500">
                  Job #{a.jobpost_id} · Talent #{a.talent_id ?? "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-neutral-200">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status?: string | null }) {
  const s = (status || "unknown").toLowerCase();

  const cls =
    s === "pending"
      ? "border-purple-500/60 bg-purple-950/40 text-purple-100"
      : s === "accepted"
        ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-100"
        : s === "rejected"
          ? "border-red-500/60 bg-red-950/40 text-red-100"
          : "border-neutral-600/70 bg-neutral-900/70 text-neutral-100";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${cls}`}
    >
      {s}
    </span>
  );
}

function initials(name?: string | null) {
  const n = (name || "").trim();
  if (!n) return "??";
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function formatDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}