"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";

type AgencyStats = {
  total_talent: number;
  total_applications: number;
  applications_by_status: Record<string, number>;
};

export default function AgencyDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();

  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Role check
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "agency") {
      if (user.role === "company") router.replace("/dashboard/company");
      else if (user.role === "admin") router.replace("/dashboard/admin");
      else router.replace("/dashboard/company");
    }
  }, [user, loading, router]);

  // Load agency stats
  useEffect(() => {
    if (!user || user.role !== "agency") return;

    const load = async () => {
      setStatsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/dashboard/agency", { cache: "no-store" });
        const text = await res.text();

        if (!res.ok) {
          let detail: unknown = text;
          try {
            const parsed = text ? JSON.parse(text) : null;
            if (parsed && typeof parsed === "object" && "detail" in parsed) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              detail = (parsed as any).detail ?? detail;
            }
          } catch {
            // ignore
          }

          setError(
            typeof detail === "string" ? detail : "Failed to load agency dashboard",
          );
          setStats(null);
          return;
        }

        const data = text ? JSON.parse(text) : null;
        setStats(data as AgencyStats);
      } catch (err: any) {
        setError(
          typeof err?.message === "string"
            ? err.message
            : "Failed to load agency dashboard",
        );
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    load();
  }, [user]);

  // Flattened: no page-level min-h-screen/bg/text; layout provides it
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agency dashboard</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Overview of talent and applications.
          </p>
        </div>
      </header>

      {loading || !user ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          Loading…
        </div>
      ) : null}

      {!loading && user && error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-6 py-4 text-sm text-red-200">
          <p className="font-medium">Failed to load agency dashboard</p>
          <p className="mt-1 break-all text-xs text-red-200/80">{error}</p>
        </div>
      )}

      {!loading && user && !error && (statsLoading || !stats) && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          Loading dashboard…
        </div>
      )}

      {!loading && user && !error && stats && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total talent" value={stats.total_talent} />
            <StatCard label="Total applications" value={stats.total_applications} />

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-5 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                Applications by status
              </p>

              {Object.keys(stats.applications_by_status).length === 0 ? (
                <p className="mt-3 text-sm text-neutral-400">
                  No applications yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {Object.entries(stats.applications_by_status).map(
                    ([status, count]) => (
                      <li key={status} className="flex items-center justify-between">
                        <span className="text-neutral-400">{status}</span>
                        <span className="font-semibold text-purple-300">{count}</span>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-5 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-purple-300">{value}</p>
    </div>
  );
}