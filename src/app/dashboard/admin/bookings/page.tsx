"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Booking = {
  id: number;
  jobpost_id: number;
  talent_id: number;
  start_date: string;
  end_date: string;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) {
        throw new Error(`STATUS ${res.status}: ${text || "EMPTY"}`);
      }

      const parsed = text ? JSON.parse(text) : [];
      setBookings(Array.isArray(parsed) ? parsed : []);
    } catch (err: any) {
      setError(
        typeof err?.message === "string"
          ? err.message
          : "Failed to load bookings",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">All Bookings</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Every booking across the platform.
            </p>
          </div>

          <Link
            href="/dashboard/admin"
            className="text-xs text-neutral-400 hover:text-neutral-200 underline"
          >
            ← Back to admin
          </Link>
        </header>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
          {loading && (
            <p className="py-8 text-center text-sm text-neutral-400">
              Loading bookings…
            </p>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-400">
              No bookings found.
            </p>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                      Booking #{b.id}
                    </p>
                    <span className="text-xs text-neutral-400">
                      Job #{b.jobpost_id} · Talent #{b.talent_id}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-neutral-400">
                    {new Date(b.start_date).toLocaleDateString()} →{" "}
                    {new Date(b.end_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}