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

      <div className="overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-950/70 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <div className="border-b border-neutral-800/80 bg-gradient-to-r from-purple-900/30 via-neutral-900 to-neutral-950 px-6 py-6">
          {loading ? (
            <div className="text-sm text-neutral-400">Loading job…</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              <p className="font-medium">Job not found</p>
              <p className="mt-1 break-all text-xs text-red-200/80">{error}</p>
            </div>
          ) : !job ? (
            <div className="text-sm text-neutral-400">No job data available.</div>
          ) : (
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-purple-500/40 bg-purple-950/30 px-3 py-1 text-[11px] font-medium text-purple-200">
                    Job #{job.id}
                  </span>

                  {!isArchived ? (
                    <StatusTag label="Active" tone="purple" />
                  ) : (
                    <StatusTag label="Archived" tone="neutral" />
                  )}

                  {job.is_urgent ? <StatusTag label="Urgent" tone="red" /> : null}
                  {job.ir35_type ? <StatusTag label={`${job.ir35_type} IR35`} tone="neutral" /> : null}
                  {job.contract_type ? <StatusTag label={job.contract_type} tone="neutral" /> : null}
                </div>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  {job.title}
                </h2>

                <p className="mt-3 text-sm text-neutral-400">
                  {[
                    job.profession_category,
                    job.profession,
                    job.engineering_discipline,
                    job.industry,
                    job.location,
                  ]
                    .filter(Boolean)
                    .join(" • ") || "No summary details"}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <TopStat
                    label="Rate"
                    value={
                      job.rate_type === "hour"
                        ? formatRange(job.hourly_rate_min, job.hourly_rate_max, "hour")
                        : formatRange(job.day_rate_min, job.day_rate_max, "day")
                    }
                  />
                  <TopStat label="Discipline" value={job.engineering_discipline} />
                  <TopStat label="Location" value={job.location} />
                  <TopStat label="Experience" value={job.experience_level} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
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
          )}
        </div>

        {!loading && !error && job && (
          <div className="space-y-4 px-6 py-6">
            {isArchived && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-sm text-neutral-200">
                This job is archived. Editing and sourcing actions are disabled until you restore it.
              </div>
            )}

            <CollapsibleSection title="Role overview" defaultOpen>
              <TextBlock value={job.description} empty="No description provided." />
            </CollapsibleSection>

            <CollapsibleSection title="Classification" defaultOpen>
              <DetailGrid
                items={[
                  ["Profession category", job.profession_category],
                  ["Profession", job.profession],
                  ["Engineering discipline", job.engineering_discipline],
                  ["Industry", job.industry],
                  ["Experience level", job.experience_level],
                  ["Contract type", job.contract_type],
                ]}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Location & site" defaultOpen>
              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldBlock label="Location" value={job.location} />
                  <FieldBlock label="Postcode" value={job.postcode} />
                  <FieldBlock
                    label="Work radius"
                    value={job.work_radius_miles != null ? `${job.work_radius_miles} miles` : ""}
                  />
                  <FieldBlock label="Site name" value={job.site_name} />
                </div>

                <FieldBlock label="Site address" value={job.site_address} multiline />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Schedule">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <FieldBlock label="Start date" value={formatDate(job.start_date)} />
                <FieldBlock label="End date" value={formatDate(job.end_date)} />
                <FieldBlock label="Start time" value={formatTime(job.start_time)} />
                <FieldBlock label="End time" value={formatTime(job.end_time)} />
                <FieldBlock label="Shift pattern" value={job.shift_pattern} />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Commercials">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FieldBlock label="Rate type" value={job.rate_type} />
                <FieldBlock
                  label="Day rate range"
                  value={formatRange(job.day_rate_min, job.day_rate_max, "day")}
                />
                <FieldBlock
                  label="Hourly rate range"
                  value={formatRange(job.hourly_rate_min, job.hourly_rate_max, "hour")}
                />
                <FieldBlock label="IR35" value={job.ir35_type} />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Requirements">
              <div className="grid gap-4 lg:grid-cols-3">
                <FieldBlock label="Required skills" value={job.required_skills} multiline />
                <FieldBlock label="Preferred skills" value={job.preferred_skills} multiline />
                <FieldBlock
                  label="Required qualifications"
                  value={job.required_qualifications}
                  multiline
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Job flags">
              <div className="flex flex-wrap gap-2">
                <FlagPill label="Urgent" active={!!job.is_urgent} />
                <FlagPill label="Requires travel" active={!!job.requires_travel} />
                <FlagPill label="Requires vehicle" active={!!job.requires_vehicle} />
                <FlagPill label="Requires own tools" active={!!job.requires_own_tools} />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Sourcing options" defaultOpen>
              <p className="text-sm text-neutral-400">
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
            </CollapsibleSection>

            <div className="border-t border-neutral-800 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="text-xs text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
              >
                Back to job list
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-neutral-900/30"
      >
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-xs text-neutral-400">{open ? "−" : "+"}</span>
      </button>

      {open && <div className="border-t border-neutral-800/70 px-5 py-4">{children}</div>}
    </section>
  );
}

function TopStat({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-black/20 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">
        {value?.trim() ? value : "Not specified"}
      </p>
    </div>
  );
}

function DetailGrid({ items }: { items: Array<[string, string | null | undefined]> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map(([label, value]) => (
        <FieldBlock key={label} label={label} value={value} />
      ))}
    </div>
  );
}

function FieldBlock({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string | null;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-800/70 bg-black/20 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </p>
      <p
        className={`mt-2 text-sm text-neutral-200 ${
          multiline ? "whitespace-pre-line leading-relaxed" : ""
        }`}
      >
        {value?.trim() ? value : "Not specified"}
      </p>
    </div>
  );
}

function TextBlock({ value, empty }: { value?: string | null; empty: string }) {
  return (
    <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-200">
      {value?.trim() ? value : empty}
    </p>
  );
}

function StatusTag({
  label,
  tone,
}: {
  label: string;
  tone: "purple" | "neutral" | "red";
}) {
  const cls =
    tone === "red"
      ? "border-red-500/60 bg-red-950/40 text-red-100"
      : tone === "neutral"
        ? "border-neutral-600/70 bg-neutral-900/70 text-neutral-100"
        : "border-purple-500/60 bg-purple-950/40 text-purple-100";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function FlagPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
        active
          ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-100"
          : "border-neutral-700 bg-neutral-900 text-neutral-400"
      }`}
    >
      {label}: {active ? "Yes" : "No"}
    </span>
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