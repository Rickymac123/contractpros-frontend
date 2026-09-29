"use client";

// src/app/dashboard/professional/page.tsx
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type MyApplication = {
  id?: number;
  application_id?: number;
  status?: string | null;
  jobpost_id?: number | null;
};

type BookingRequestItem = {
  id: number;
  status?: string | null;
};

export default function ProfessionalDashboardPage() {
  const [apps, setApps] = useState<MyApplication[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [appsRes, requestsRes] = await Promise.all([
          fetch("/api/professional/applications", { cache: "no-store" }),
          fetch("/api/professional/booking-requests", { cache: "no-store" }),
        ]);

        const [appsText, requestsText] = await Promise.all([
          appsRes.text(),
          requestsRes.text(),
        ]);

        if (!appsRes.ok) {
          setError(`APPLICATIONS STATUS ${appsRes.status}: ${appsText || "EMPTY"}`);
          setApps([]);
          setBookingRequests([]);
          return;
        }

        if (!requestsRes.ok) {
          setError(`BOOKING REQUESTS STATUS ${requestsRes.status}: ${requestsText || "EMPTY"}`);
          setApps([]);
          setBookingRequests([]);
          return;
        }

        const appsData = appsText ? JSON.parse(appsText) : [];
        const requestsData = requestsText ? JSON.parse(requestsText) : [];

        setApps(Array.isArray(appsData) ? appsData : []);
        setBookingRequests(Array.isArray(requestsData) ? requestsData : []);
      } catch (e: any) {
        setError(typeof e?.message === "string" ? e.message : "Failed to load");
        setApps([]);
        setBookingRequests([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const counts = useMemo(() => {
    const inReview = apps.filter(
      (a) => (a.status ?? "").toLowerCase() === "pending",
    ).length;

    const shortlisted = apps.filter(
      (a) => (a.status ?? "").toLowerCase() === "shortlisted",
    ).length;

    const rejected = apps.filter(
      (a) => (a.status ?? "").toLowerCase() === "rejected",
    ).length;

    const accepted = apps.filter(
      (a) => (a.status ?? "").toLowerCase() === "accepted",
    ).length;

    const pendingBookingRequests = bookingRequests.filter(
      (r) => (r.status ?? "").toLowerCase() === "pending",
    ).length;

    const upcomingBookings = 0;

    return {
      inReview,
      shortlisted,
      rejected,
      accepted,
      pendingBookingRequests,
      upcomingBookings,
    };
  }, [apps, bookingRequests]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Professional dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Overview of your applications, booking requests and bookings.
          </p>
        </div>

        <Link
          href="/dashboard/marketplace/jobs"
          className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40"
        >
          Browse jobs →
        </Link>
      </div>

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
          <div className="grid gap-4 md:grid-cols-5">
            <StatCard
              label="Applications in review"
              value={counts.inReview}
              href="/dashboard/professional/applications?status=pending"
            />
            <StatCard
              label="Applications shortlisted"
              value={counts.shortlisted}
              href="/dashboard/professional/applications?status=shortlisted"
            />
            <StatCard
              label="Applications rejected"
              value={counts.rejected}
              href="/dashboard/professional/applications?status=rejected"
            />
            <StatCard
              label="Applications accepted"
              value={counts.accepted}
              href="/dashboard/professional/applications?status=accepted"
            />
            <StatCard
              label="Booking requests"
              value={counts.pendingBookingRequests}
              href="/dashboard/professional/booking-requests"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <StatCard
              label="Upcoming bookings"
              value={counts.upcomingBookings}
            />
          </div>

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
                href="/dashboard/professional/applications?status=shortlisted"
                className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-2 text-xs text-amber-200 transition hover:bg-amber-900/30"
              >
                View shortlisted jobs
              </Link>

              <Link
                href="/dashboard/professional/booking-requests"
                className="rounded-xl border border-purple-500/30 bg-purple-950/20 px-4 py-2 text-xs text-purple-200 transition hover:bg-purple-900/30"
              >
                <span className="inline-flex items-center gap-2">
                  <span>Booking requests</span>
                  {counts.pendingBookingRequests > 0 && (
                    <span className="rounded-full bg-purple-600/30 px-2 py-0.5 text-[10px] text-purple-100">
                      {counts.pendingBookingRequests} pending
                    </span>
                  )}
                </span>
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

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-xs uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-purple-300">
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-5 transition hover:border-neutral-700 hover:bg-neutral-900/70"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-5">
      {content}
    </div>
  );
}