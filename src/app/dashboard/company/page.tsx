"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CompanyDashboard = {
  total_jobs: number;
  total_applications: number;
  total_bookings: number;
  applications_by_status: Record<string, number>;
};

export default function CompanyDashboardPage() {
  const [data, setData] = useState<CompanyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/dashboard/company", {
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`STATUS ${res.status}: ${text || "EMPTY"}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(
          typeof err?.message === "string"
            ? err.message
            : "Failed to load company dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Company dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Overview of your jobs, applications and bookings
          </p>
        </div>

        <Link
          href="/dashboard/company/jobs"
          className="rounded-xl border border-purple-500/70 bg-purple-600/80 px-4 py-2 text-sm font-medium shadow-[0_0_25px_rgba(168,85,247,0.35)] transition hover:bg-purple-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.55)]"
        >
          Manage jobs →
        </Link>
      </header>

      {/* States */}
      {loading && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          Loading dashboard…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-6 py-4 text-sm text-red-200">
          <p className="font-medium">Failed to load dashboard</p>
          <p className="mt-1 break-all text-xs text-red-200/80">{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Active jobs" value={data.total_jobs} />
            <StatCard label="Applications" value={data.total_applications} />
            <StatCard label="Bookings" value={data.total_bookings} />
          </div>

          {/* Applications by status */}
          <div className="rounded-3xl border border-neutral-800/80 bg-gradient-to-b from-neutral-900/80 to-black/90 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            <div className="border-b border-neutral-800/80 px-6 py-4">
              <h2 className="text-sm font-medium text-neutral-200">
                Applications by status
              </h2>
            </div>

            <div className="px-6 py-6">
              {Object.keys(data.applications_by_status).length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No applications yet.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {Object.entries(data.applications_by_status).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-3"
                      >
                        <p className="text-xs uppercase tracking-wide text-neutral-400">
                          {status}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {count}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-5 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
      <p className="text-xs uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-purple-300">
        {value}
      </p>
    </div>
  );
}