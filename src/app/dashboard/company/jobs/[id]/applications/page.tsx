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
  talent_hourly_rate?: number | null;
  talent_rate_type?: string | null;
  talent_avatar_url?: string | null;

  talent_industry?: string | null;
  talent_engineering_discipline?: string | null;

  match_percentage?: number | null;
  match_reasons?: string[] | null;
  mismatch_reasons?: string[] | null;
};

export default function CompanyJobApplicationsPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = typeof params?.id === "string" ? params.id : undefined;

  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
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

  const updateApplicationStatus = async (
    applicationId: number,
    status: string,
    notes?: string,
  ) => {
    try {
      setUpdatingId(applicationId);
      setError(null);

      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          status,
          ...(notes !== undefined ? { notes } : {}),
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(`STATUS_${res.status}: ${text || "EMPTY"}`);
        return;
      }

      setRejectingId(null);
      setRejectReason("");
      await load({ silent: true });
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_UPDATE_STATUS");
    } finally {
      setUpdatingId(null);
    }
  };

  const backToJob = () => {
    if (!jobId) return router.push("/dashboard/company/jobs");
    router.push(`/dashboard/company/jobs/${jobId}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
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
        <div className="space-y-4">
          {apps.map((a) => {
            const showEngDiscipline = !!a.talent_engineering_discipline?.trim();

            const metaParts = [
              a.talent_profession || "Profession not set",
              a.talent_location || "Location not set",
              a.talent_industry?.trim() ? `Industry: ${a.talent_industry}` : null,
              showEngDiscipline ? `Discipline: ${a.talent_engineering_discipline}` : null,
            ].filter(Boolean) as string[];

            const isUpdating = updatingId === a.application_id;
            const status = (a.status || "unknown").toLowerCase();
            const matchPercentage = Math.max(
              0,
              Math.min(100, Number(a.match_percentage ?? 0)),
            );
            const matchReasons = Array.isArray(a.match_reasons) ? a.match_reasons : [];
            const mismatchReasons = Array.isArray(a.mismatch_reasons)
              ? a.mismatch_reasons
              : [];

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
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-950/30">
                        <span className="text-sm font-semibold text-purple-200">
                          {initials(a.talent_name)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {a.talent_name || `Talent #${a.talent_id ?? "?"}`}
                        </p>

                        <p className="mt-0.5 text-xs text-neutral-400">
                          {metaParts.join(" · ")}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <StatusPill status={a.status} />
                          <MatchPill percentage={matchPercentage} />
                        </div>

                        <div className="w-32">
                          <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                            <div
                              className={matchBarClass(matchPercentage)}
                              style={{ width: `${matchPercentage}%` }}
                            />
                          </div>
                          <p className="mt-1 text-right text-[11px] text-neutral-500">
                            {matchPercentage}% match
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-4">
                      <InfoBox
                        label="Rate"
                        value={formatRate(a)}
                      />
                      <InfoBox label="Applied" value={formatDate(a.created_at) || "—"} />
                      <InfoBox label="Updated" value={formatDate(a.updated_at) || "—"} />
                      <InfoBox
                        label="Match"
                        value={`${matchPercentage}%`}
                      />
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <CriteriaBox
                        title="Matches"
                        items={matchReasons}
                        emptyText="No matching criteria flagged."
                        tone="good"
                      />
                      <CriteriaBox
                        title="Gaps / mismatches"
                        items={mismatchReasons}
                        emptyText="No mismatches flagged."
                        tone="bad"
                      />
                    </div>

                    <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                        Notes
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm text-neutral-200">
                        {a.notes?.trim() ? a.notes : "No notes provided."}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/company/applications/${a.application_id}`}
                        className="rounded-lg border border-purple-500/40 bg-purple-950/30 px-3 py-1.5 text-[11px] font-medium text-purple-200 transition hover:bg-purple-900/40"
                      >
                        View profile
                      </Link>

                      {status !== "shortlisted" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => updateApplicationStatus(a.application_id, "shortlisted")}
                          className="rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 text-[11px] font-medium text-amber-200 transition hover:bg-amber-900/40 disabled:opacity-60"
                        >
                          {isUpdating ? "Updating…" : "Shortlist"}
                        </button>
                      )}

                      {status !== "accepted" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => updateApplicationStatus(a.application_id, "accepted")}
                          className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-1.5 text-[11px] font-medium text-emerald-200 transition hover:bg-emerald-900/40 disabled:opacity-60"
                        >
                          {isUpdating ? "Updating…" : "Accept"}
                        </button>
                      )}

                      {status !== "rejected" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => {
                            setRejectingId(a.application_id);
                            setRejectReason("");
                          }}
                          className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-1.5 text-[11px] font-medium text-red-200 transition hover:bg-red-900/40 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      )}

                      <span className="ml-auto text-[11px] text-neutral-500">
                        App #{a.application_id}
                      </span>
                    </div>

                    {rejectingId === a.application_id && (
                      <div className="mt-3 rounded-xl border border-red-500/30 bg-red-950/20 p-4">
                        <div className="text-xs font-medium text-red-200">Reason for rejection</div>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={4}
                          className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-sm text-white outline-none focus:border-red-400"
                          placeholder="Enter the reason for rejection..."
                        />
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            className="rounded-lg border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-[11px] font-medium text-neutral-200 transition hover:bg-neutral-900"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isUpdating || !rejectReason.trim()}
                            onClick={() =>
                              updateApplicationStatus(
                                a.application_id,
                                "rejected",
                                rejectReason.trim(),
                              )
                            }
                            className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-1.5 text-[11px] font-medium text-red-200 transition hover:bg-red-900/40 disabled:opacity-60"
                          >
                            {isUpdating ? "Updating…" : "Confirm rejection"}
                          </button>
                        </div>
                      </div>
                    )}
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

function CriteriaBox({
  title,
  items,
  emptyText,
  tone,
}: {
  title: string;
  items: string[];
  emptyText: string;
  tone: "good" | "bad";
}) {
  const boxClass =
    tone === "good"
      ? "border-emerald-500/20 bg-emerald-950/10"
      : "border-red-500/20 bg-red-950/10";

  const dotClass = tone === "good" ? "bg-emerald-400" : "bg-red-400";

  return (
    <div className={`rounded-xl border px-4 py-3 ${boxClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {title}
      </p>

      {items.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-neutral-200">
              <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-neutral-500">{emptyText}</p>
      )}
    </div>
  );
}

function StatusPill({ status }: { status?: string | null }) {
  const s = (status || "unknown").toLowerCase();

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

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${cls}`}
    >
      {s}
    </span>
  );
}

function MatchPill({ percentage }: { percentage: number }) {
  const cls =
    percentage >= 80
      ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-100"
      : percentage >= 60
        ? "border-purple-500/60 bg-purple-950/40 text-purple-100"
        : percentage >= 40
          ? "border-amber-500/60 bg-amber-950/40 text-amber-100"
          : "border-red-500/60 bg-red-950/40 text-red-100";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${cls}`}>
      {percentage}% match
    </span>
  );
}

function matchBarClass(percentage: number) {
  if (percentage >= 80) return "h-full rounded-full bg-emerald-400";
  if (percentage >= 60) return "h-full rounded-full bg-purple-400";
  if (percentage >= 40) return "h-full rounded-full bg-amber-400";
  return "h-full rounded-full bg-red-400";
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

function formatRate(a: JobApplication) {
  if (a.talent_rate_type === "hour" && typeof a.talent_hourly_rate === "number") {
    return `£${a.talent_hourly_rate}/hr`;
  }
  if (typeof a.talent_day_rate === "number") {
    return `£${a.talent_day_rate}/day`;
  }
  return "Not set";
}