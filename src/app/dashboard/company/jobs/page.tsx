"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Job = {
  id: number;
  title: string;
  location: string;
  profession?: string | null;
  day_rate_min?: number | null;
  day_rate_max?: number | null;
  description?: string | null;
  is_archived?: boolean | null; // defensive
};

export default function CompanyJobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/company/jobs", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`STATUS ${res.status}: ${text || "EMPTY"}`);
      }

      const data = await res.json();

      const jobsArray: Job[] = Array.isArray(data)
        ? data
        : Array.isArray((data as any).jobs)
          ? (data as any).jobs
          : Array.isArray((data as any).recent_jobs)
            ? (data as any).recent_jobs
            : [];

      setJobs(jobsArray);
    } catch (err: any) {
      setError(
        typeof err?.message === "string" ? err.message : "Failed to load jobs",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Flattened: remove per-page bg/min-h-screen/gradient shells. Layout owns that.
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Company Jobs</h1>
          <p className="mt-1 text-sm text-neutral-400">
            View and manage all jobs you&apos;ve posted.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/company/jobs/archived"
            className="rounded-xl border border-neutral-700 bg-neutral-900/60 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-900"
          >
            Archived
          </Link>

          <Link
            href="/dashboard/company/jobs/new"
            className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-sm font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40"
          >
            + New Job
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/70">
        <div className="border-b border-neutral-800/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-200">Job listings</h2>
            <button
              onClick={loadJobs}
              className="rounded-lg border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-neutral-500 hover:bg-neutral-900"
            >
              Refresh
            </button>
          </div>

          <p className="mt-1 text-xs text-neutral-500">
            You currently have{" "}
            <span className="font-semibold text-neutral-200">{jobs.length}</span>{" "}
            active job{jobs.length === 1 ? "" : "s"}.
          </p>
        </div>

        <div className="px-6 py-4">
          {loading && (
            <div className="py-12 text-center text-sm text-neutral-400">
              Loading jobs…
            </div>
          )}

          {!loading && error && (
            <div className="space-y-2 rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              <div className="font-medium">Failed to load jobs</div>
              <div className="break-all text-xs text-red-200/80">{error}</div>
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-400">
              You don&apos;t have any active jobs yet. Create your first job — or
              check{" "}
              <Link
                href="/dashboard/company/jobs/archived"
                className="text-purple-300 underline decoration-purple-500/40 underline-offset-4 hover:text-purple-200"
              >
                archived jobs
              </Link>
              .
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <div className="space-y-3">
              {jobs.map((job) => {
                const leakedArchived = !!job.is_archived;

                return (
                  <div
                    key={job.id}
                    className="group flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 transition hover:border-purple-500/50"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-neutral-50">
                            {job.title}
                          </h3>

                          {leakedArchived && (
                            <span className="rounded-full border border-neutral-600/70 bg-neutral-900/70 px-2 py-0.5 text-[11px] text-neutral-200">
                              Archived
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-400">
                          {job.location && (
                            <span className="rounded-full border border-neutral-700/80 bg-neutral-900/60 px-2 py-0.5">
                              {job.location}
                            </span>
                          )}
                          {job.profession && (
                            <span className="rounded-full border border-purple-700/70 bg-purple-950/30 px-2 py-0.5 text-purple-200">
                              {job.profession}
                            </span>
                          )}
                          {job.day_rate_min != null && job.day_rate_max != null && (
                            <span className="rounded-full border border-neutral-700/80 bg-neutral-900/60 px-2 py-0.5">
                              £{job.day_rate_min} – £{job.day_rate_max} /day
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/company/jobs/${job.id}`}
                        className="text-xs font-medium text-purple-300 transition group-hover:text-purple-200"
                      >
                        View details →
                      </Link>
                    </div>

                    {job.description && (
                      <p className="text-xs text-neutral-400 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}