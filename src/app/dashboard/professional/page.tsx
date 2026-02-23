"use client";

// src/app/dashboard/professional/page.tsx
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type MyApplication = {
  id: number;
  status?: string | null;
  jobpost_id?: number | null;
};

export default function ProfessionalDashboardPage() {
  const [apps, setApps] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/professional/applications", {
          cache: "no-store",
        });

        const text = await res.text();
        if (!res.ok) {
          setError(`STATUS ${res.status}: ${text || "EMPTY"}`);
          setApps([]);
          return;
        }

        const data = text ? JSON.parse(text) : [];
        setApps(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(typeof e?.message === "string" ? e.message : "Failed to load");
        setApps([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const counts = useMemo(() => {
    const review = apps.filter(
      (a) => (a.status ?? "").toLowerCase() === "pending",
    ).length;

    const rejected = apps.filter(
      (a) => (a.status ?? "").toLowerCase() === "rejected",
    ).length;

    const upcomingBookings = 0;

    return { review, rejected, upcomingBookings };
  }, [apps]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Professional dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Overview of your applications and bookings.
          </p>
        </div>

        <Link
          href="/dashboard/marketplace/jobs"
          className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40"
        >
          Browse jobs →
        </Link>
      </div>

      {/* States */}
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
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Applications in review" value={counts.review} />
            <StatCard label="Applications rejected" value={counts.rejected} />
            <StatCard label="Upcoming bookings" value={counts.upcomingBookings} />
          </div>

          {/* Quick actions */}
          <div className="rounded-3xl border border-neutral-800/80 bg-neutral-950/60">
            <div className="border-b border-neutral-800/80 px-6 py-4">
              <h2 className="text-sm font-medium text-neutral-200">
                Quick actions
              </h2>
            </div>

            <div className="px-6 py-6 flex flex-wrap gap-2">
              <Link
                href="/dashboard/professional/profile"
                className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
              >
                Edit my profile
              </Link>

              {/* NEW BUTTON INSERTED HERE */}
              <Link
                href="/dashboard/professional/preview"
                className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
              >
                Preview my profile
              </Link>

              <Link
                href="/dashboard/professional/applications"
                className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
              >
                View my applications
              </Link>

              <Link
                href="/dashboard/professional/availability"
                className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
              >
                Manage availability
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-5">
      <p className="text-xs uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-purple-300">
        {value}
      </p>
    </div>
  );
}