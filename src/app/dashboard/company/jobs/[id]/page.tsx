"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Job = {
  id: number;
  title: string;
  description: string;
  location: string;
  profession: string;
  day_rate_min: number;
  day_rate_max: number;
  company_id?: number;
  is_archived?: boolean;
};

export default function CompanyJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params?.id === "string" ? params.id : undefined;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isArchiving, setIsArchiving] = useState<boolean>(false);
  const [confirmArchive, setConfirmArchive] = useState<boolean>(false);

  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [confirmRestore, setConfirmRestore] = useState<boolean>(false);

  const fetchJob = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/company/jobs/${jobId}`);
      const text = await res.text();

      if (!res.ok) {
        setError(
          `JOB_FETCH_STATUS_${res.status}: ${text || "EMPTY_RESPONSE_FROM_API"}`,
        );
        setJob(null);
        return;
      }

      let parsed: any;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        setError("FAILED_TO_PARSE_JOB_RESPONSE");
        setJob(null);
        return;
      }

      const jobData =
        parsed && typeof parsed === "object" && "job" in parsed
          ? parsed.job
          : parsed;

      if (!jobData || typeof jobData !== "object") {
        setError("INVALID_JOB_PAYLOAD");
        setJob(null);
        return;
      }

      setJob(jobData as Job);
    } catch (err: any) {
      setError(
        typeof err?.message === "string" ? err.message : "UNKNOWN_JOB_FETCH_ERROR",
      );
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) {
      setError("MISSING_JOB_ID");
      setLoading(false);
      return;
    }
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleBack = () => router.push("/dashboard/company/jobs");

  const handleEdit = () => {
    if (!jobId) return;
    router.push(`/dashboard/company/jobs/${jobId}/edit`);
  };

  const handleArchive = async () => {
    if (!jobId || isArchiving) return;

    try {
      setIsArchiving(true);

      const res = await fetch(`/api/company/jobs/${jobId}`, { method: "DELETE" });
      const text = await res.text();

      if (!res.ok) {
        console.error("Archive failed:", res.status, text);
        alert(
          `Failed to archive job (status ${res.status}). Check console for details.`,
        );
        return;
      }

      await fetchJob();
    } catch (err: any) {
      console.error("Archive error:", err);
      alert("An unexpected error occurred while archiving the job.");
    } finally {
      setIsArchiving(false);
      setConfirmArchive(false);
    }
  };

  const handleRestore = async () => {
    if (!jobId || isRestoring) return;

    try {
      setIsRestoring(true);

      const res = await fetch(`/api/company/jobs/${jobId}/restore`, {
        method: "POST",
      });
      const text = await res.text();

      if (!res.ok) {
        console.error("Restore failed:", res.status, text);
        alert(
          `Failed to restore job (status ${res.status}). Check console for details.`,
        );
        return;
      }

      await fetchJob();
    } catch (err: any) {
      console.error("Restore error:", err);
      alert("An unexpected error occurred while restoring the job.");
    } finally {
      setIsRestoring(false);
      setConfirmRestore(false);
    }
  };

  const isArchived = !!job?.is_archived;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Job details</h1>
          <p className="mt-1 text-sm text-neutral-400">
            View, edit, archive or restore this job.
          </p>
        </div>

        <button
          onClick={handleBack}
          className="rounded-xl border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-900"
        >
          ← Back to jobs
        </button>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/70">
        <div className="border-b border-neutral-800/80 bg-gradient-to-r from-purple-900/30 via-neutral-900 to-neutral-950 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300/80">
            Company job
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            RMC – Contract & Interim Talent
          </p>
        </div>

        <div className="space-y-6 px-6 py-6">
          {loading && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-10 text-center text-sm text-neutral-400">
              Loading job…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              <p className="font-medium">Job not found</p>
              <p className="mt-1 break-all text-xs text-red-200/80">{error}</p>
            </div>
          )}

          {!loading && !error && !job && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-10 text-center text-sm text-neutral-400">
              No job data available.
            </div>
          )}

          {!loading && !error && job && (
            <>
              {/* Title + meta */}
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{job.title}</h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    {job.profession || "Unspecified profession"} ·{" "}
                    {job.location || "Location not set"}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  {!isArchived ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/60 bg-purple-950/40 px-3 py-1 text-xs font-medium text-purple-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-600/70 bg-neutral-900/70 px-3 py-1 text-xs font-medium text-neutral-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                      Archived
                    </span>
                  )}

                  <p className="text-xs text-neutral-400">
                    Job ID:{" "}
                    <span className="font-mono text-neutral-200">#{job.id}</span>
                  </p>
                </div>
              </div>

              {isArchived && (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-sm text-neutral-200">
                  This job is archived. Editing is disabled until you restore it.
                </div>
              )}

              {/* Pay band */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    Day rate range
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    £{job.day_rate_min} – £{job.day_rate_max}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Outside IR35 (placeholder)
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    Location
                  </p>
                  <p className="mt-1 text-sm text-neutral-200">
                    {job.location || "Not specified"}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    Profession
                  </p>
                  <p className="mt-1 text-sm text-neutral-200">
                    {job.profession || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Role overview
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-200">
                  {job.description || "No description provided for this job."}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-4">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/company/jobs/${job.id}/applications`}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-2 text-xs font-medium text-neutral-200 transition hover:bg-neutral-900"
                  >
                    View applications →
                  </Link>

                  <button
                    type="button"
                    onClick={handleEdit}
                    disabled={!jobId || isArchived}
                    className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-500"
                  >
                    Edit
                  </button>

                  {!isArchived ? (
                    !confirmArchive ? (
                      <button
                        type="button"
                        onClick={() => setConfirmArchive(true)}
                        disabled={isArchiving || !jobId}
                        className="rounded-xl border border-red-500/70 bg-red-900/40 px-4 py-2 text-xs font-medium text-red-50 transition hover:border-red-400 hover:bg-red-800/60 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-500"
                      >
                        Archive
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleArchive}
                          disabled={isArchiving}
                          className="rounded-xl border border-red-400/80 bg-red-800/60 px-4 py-2 text-xs font-medium text-red-50 transition hover:bg-red-700/70 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-500"
                        >
                          {isArchiving ? "Archiving…" : "Confirm archive"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmArchive(false)}
                          disabled={isArchiving}
                          className="rounded-xl border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </>
                    )
                  ) : !confirmRestore ? (
                    <button
                      type="button"
                      onClick={() => setConfirmRestore(true)}
                      disabled={isRestoring || !jobId}
                      className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:opacity-60"
                    >
                      Restore
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleRestore}
                        disabled={isRestoring}
                        className="rounded-xl border border-purple-400/80 bg-purple-700/50 px-4 py-2 text-xs font-medium text-purple-50 transition hover:bg-purple-700/60 disabled:opacity-60"
                      >
                        {isRestoring ? "Restoring…" : "Confirm restore"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmRestore(false)}
                        disabled={isRestoring}
                        className="rounded-xl border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
                >
                  Back to job list
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}