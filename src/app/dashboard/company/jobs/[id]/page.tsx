"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Job = {
  id: number;
  title: string;
  description?: string | null;

  profession_category?: string | null;
  profession?: string | null;
  engineering_discipline?: string | null;
  industry?: string | null;

  location?: string | null;
  postcode?: string | null;
  work_radius_miles?: number | null;
  site_name?: string | null;
  site_address?: string | null;

  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  shift_pattern?: string | null;

  rate_type?: string | null;
  day_rate_min?: number | null;
  day_rate_max?: number | null;
  hourly_rate_min?: number | null;
  hourly_rate_max?: number | null;
  ir35_type?: string | null;

  required_skills?: string | null;
  preferred_skills?: string | null;
  required_qualifications?: string | null;
  experience_level?: string | null;

  contract_type?: string | null;
  is_urgent?: boolean | null;
  requires_travel?: boolean | null;
  requires_vehicle?: boolean | null;
  requires_own_tools?: boolean | null;

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
        setError(`JOB_FETCH_STATUS_${res.status}: ${text || "EMPTY_RESPONSE_FROM_API"}`);
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
        parsed && typeof parsed === "object" && "job" in parsed ? parsed.job : parsed;

      if (!jobData || typeof jobData !== "object") {
        setError("INVALID_JOB_PAYLOAD");
        setJob(null);
        return;
      }

      setJob(jobData as Job);
    } catch (err: any) {
      setError(typeof err?.message === "string" ? err.message : "UNKNOWN_JOB_FETCH_ERROR");
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
        alert(`Failed to archive job (status ${res.status}). ${text || ""}`);
        return;
      }

      await fetchJob();
    } catch {
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
        alert(`Failed to restore job (status ${res.status}). ${text || ""}`);
        return;
      }

      await fetchJob();
    } catch {
      alert("An unexpected error occurred while restoring the job.");
    } finally {
      setIsRestoring(false);
      setConfirmRestore(false);
    }
  };

  const isArchived = !!job?.is_archived;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Job details</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Full structured view of this role.
          </p>
        </div>

        <button
          onClick={handleBack}
          className="rounded-xl border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-900"
        >
          ← Back to jobs
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/70">
        <div className="border-b border-neutral-800/80 bg-gradient-to-r from-purple-900/30 via-neutral-900 to-neutral-950 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300/80">
            Company job
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            ContractPro&apos;s – Contract & Interim Talent
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
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-white">{job.title}</h2>

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

                    {job.is_urgent ? (
                      <span className="inline-flex items-center rounded-full border border-red-500/60 bg-red-950/40 px-3 py-1 text-xs font-medium text-red-100">
                        Urgent
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm text-neutral-400">
                    {[
                      job.profession_category,
                      job.profession,
                      job.engineering_discipline,
                      job.location,
                    ]
                      .filter(Boolean)
                      .join(" • ") || "No summary details"}
                  </p>

                  <p className="mt-2 text-xs text-neutral-500">
                    Job ID: <span className="font-mono text-neutral-200">#{job.id}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleEdit}
                    disabled={!jobId || isArchived}
                    className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-500"
                  >
                    Edit job
                  </button>

                  {!isArchived ? (
                    !confirmArchive ? (
                      <button
                        type="button"
                        onClick={() => setConfirmArchive(true)}
                        disabled={isArchiving || !jobId}
                        className="rounded-xl border border-red-500/70 bg-red-900/40 px-4 py-2 text-xs font-medium text-red-50 transition hover:border-red-400 hover:bg-red-800/60 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-500"
                      >
                        Archive job
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
                      Restore job
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
              </div>

              {isArchived && (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-sm text-neutral-200">
                  This job is archived. Editing and sourcing actions are disabled until you restore it.
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard label="Profession category" value={job.profession_category} />
                <InfoCard label="Profession" value={job.profession} />
                <InfoCard label="Engineering discipline" value={job.engineering_discipline} />
                <InfoCard label="Industry" value={job.industry} />
                <InfoCard label="Location" value={job.location} />
                <InfoCard label="Postcode" value={job.postcode} />
                <InfoCard
                  label="Work radius"
                  value={
                    job.work_radius_miles != null ? `${job.work_radius_miles} miles` : undefined
                  }
                />
                <InfoCard label="Site name" value={job.site_name} />
                <InfoCard label="Site address" value={job.site_address} />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard label="Start date" value={formatDate(job.start_date)} />
                <InfoCard label="End date" value={formatDate(job.end_date)} />
                <InfoCard label="Shift pattern" value={job.shift_pattern} />
                <InfoCard label="Start time" value={formatTime(job.start_time)} />
                <InfoCard label="End time" value={formatTime(job.end_time)} />
                <InfoCard label="Contract type" value={job.contract_type} />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard label="Rate type" value={job.rate_type} />
                <InfoCard
                  label="Day rate range"
                  value={formatRange(job.day_rate_min, job.day_rate_max, "day")}
                />
                <InfoCard
                  label="Hourly rate range"
                  value={formatRange(job.hourly_rate_min, job.hourly_rate_max, "hour")}
                />
                <InfoCard label="IR35" value={job.ir35_type} />
                <InfoCard label="Urgent" value={boolLabel(job.is_urgent)} />
                <InfoCard label="Travel required" value={boolLabel(job.requires_travel)} />
                <InfoCard label="Vehicle required" value={boolLabel(job.requires_vehicle)} />
                <InfoCard label="Own tools required" value={boolLabel(job.requires_own_tools)} />
                <InfoCard label="Experience level" value={job.experience_level} />
              </div>

              <TextCard label="Role overview" value={job.description} />
              <TextCard label="Required skills" value={job.required_skills} />
              <TextCard label="Preferred skills" value={job.preferred_skills} />
              <TextCard label="Required qualifications" value={job.required_qualifications} />

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Sourcing options
                </p>
                <p className="mt-2 text-sm text-neutral-400">
                  Search matching professionals first, or review applications already received for this job.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/company/jobs/${job.id}/search`}
                    className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40"
                  >
                    Search matching professionals
                  </Link>

                  <Link
                    href={`/dashboard/company/jobs/${job.id}/applications`}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-2 text-xs font-medium text-neutral-200 transition hover:bg-neutral-900"
                  >
                    View applications
                  </Link>
                </div>
              </div>

              <div className="mt-2 flex justify-between gap-3 border-t border-neutral-800 pt-4">
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

function InfoCard({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-neutral-200">{value?.trim() ? value : "Not specified"}</p>
    </div>
  );
}

function TextCard({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-200">
        {value?.trim() ? value : "Not specified."}
      </p>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB");
}

function formatTime(value?: string | null) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

function formatRange(
  min?: number | null,
  max?: number | null,
  unit?: "day" | "hour",
) {
  if (min == null && max == null) return "";
  const suffix = unit === "hour" ? "/hr" : unit === "day" ? "/day" : "";
  if (min != null && max != null) return `£${min} – £${max}${suffix}`;
  if (min != null) return `From £${min}${suffix}`;
  return `Up to £${max}${suffix}`;
}

function boolLabel(value?: boolean | null) {
  if (value == null) return "";
  return value ? "Yes" : "No";
}