"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Job = {
  id: number;
  title: string;
  description: string;
  location: string;
  profession: string;
  day_rate_min: number;
  day_rate_max: number;
  is_archived?: boolean;
};

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params?.id === "string" ? params.id : undefined;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [dayRateMin, setDayRateMin] = useState("");
  const [dayRateMax, setDayRateMax] = useState("");
  const [description, setDescription] = useState("");

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
        return;
      }

      let parsed: any;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        setError("FAILED_TO_PARSE_JOB_RESPONSE");
        return;
      }

      const jobData =
        parsed && typeof parsed === "object" && "job" in parsed ? parsed.job : parsed;

      if (!jobData || typeof jobData !== "object") {
        setError("INVALID_JOB_PAYLOAD");
        return;
      }

      const j = jobData as Job;
      setJob(j);
      setTitle(j.title || "");
      setProfession(j.profession || "");
      setLocation(j.location || "");
      setDayRateMin(String(j.day_rate_min ?? ""));
      setDayRateMax(String(j.day_rate_max ?? ""));
      setDescription(j.description || "");
    } catch (err: any) {
      setError(
        typeof err?.message === "string" ? err.message : "UNKNOWN_JOB_FETCH_ERROR",
      );
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

  const handleCancel = () => {
    if (!jobId) router.push("/dashboard/company/jobs");
    else router.push(`/dashboard/company/jobs/${jobId}`);
  };

  const handleRestore = async () => {
    if (!jobId || restoring) return;

    try {
      setRestoring(true);
      setError(null);

      const res = await fetch(`/api/company/jobs/${jobId}/restore`, {
        method: "POST",
      });
      const text = await res.text();

      if (!res.ok) {
        setError(
          `JOB_RESTORE_STATUS_${res.status}: ${text || "EMPTY_RESPONSE_FROM_API"}`,
        );
        return;
      }

      await fetchJob();
    } finally {
      setRestoring(false);
    }
  };

  const isArchived = !!job?.is_archived;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;
    if (isArchived) return;

    try {
      setSaving(true);
      setError(null);

      const payload = {
        title: title.trim(),
        profession: profession.trim(),
        location: location.trim(),
        day_rate_min: Number(dayRateMin) || 0,
        day_rate_max: Number(dayRateMax) || 0,
        description: description.trim(),
      };

      const res = await fetch(`/api/company/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(
          `JOB_UPDATE_STATUS_${res.status}: ${text || "EMPTY_RESPONSE_FROM_API"}`,
        );
        return;
      }

      router.push(`/dashboard/company/jobs/${jobId}`);
    } catch (err: any) {
      setError(
        typeof err?.message === "string" ? err.message : "UNKNOWN_JOB_UPDATE_ERROR",
      );
    } finally {
      setSaving(false);
    }
  };

  // Flattened: remove per-page bg/min-h-screen/glow. Let layout own it.
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit job</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Update the details for this role.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          className="rounded-xl border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-900"
        >
          ← Back
        </button>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/70">
        <div className="border-b border-neutral-800/80 bg-gradient-to-r from-purple-900/30 via-neutral-900 to-neutral-950 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300/80">
            Job editor
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            RMC – Contract & Interim Talent
          </p>
        </div>

        <div className="px-6 py-6">
          {loading && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-10 text-center text-sm text-neutral-400">
              Loading job…
            </div>
          )}

          {!loading && error && (
            <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              <p className="font-medium">There was a problem</p>
              <p className="mt-1 text-xs text-red-200/80 break-all">{error}</p>
            </div>
          )}

          {!loading && !error && !job && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-10 text-center text-sm text-neutral-400">
              Job not found.
            </div>
          )}

          {!loading && job && isArchived && (
            <div className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-sm text-neutral-200">
              This job is archived, so editing is disabled.
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={restoring}
                  className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:opacity-60"
                >
                  {restoring ? "Restoring…" : "Restore job"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800"
                >
                  Back to job
                </button>
              </div>
            </div>
          )}

          {!loading && job && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Job title
                  </label>
                  <input
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Maintenance Engineer (Nights)"
                    required
                    disabled={isArchived}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Profession
                  </label>
                  <input
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Maintenance Engineer"
                    disabled={isArchived}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Location
                </label>
                <input
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Merthyr Tydfil, South Wales"
                  disabled={isArchived}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Day rate (min)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    value={dayRateMin}
                    onChange={(e) => setDayRateMin(e.target.value)}
                    placeholder="550"
                    disabled={isArchived}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Day rate (max)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    value={dayRateMax}
                    onChange={(e) => setDayRateMax(e.target.value)}
                    placeholder="650"
                    disabled={isArchived}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Role overview
                </label>
                <textarea
                  rows={6}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key responsibilities, shift patterns, technology stack, IR35 status etc."
                  disabled={isArchived}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-4">
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving || isArchived}
                    className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-500"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-xl border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-neutral-500">
                  Job ID:{" "}
                  <span className="font-mono text-neutral-300">#{job.id}</span>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}