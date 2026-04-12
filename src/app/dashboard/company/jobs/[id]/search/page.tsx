"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type MatchItem = {
  talent_id: number;
  score: number;
  match_reasons?: string[];
  talent_name?: string | null;
  talent_profession?: string | null;
  talent_engineering_discipline?: string | null;
  talent_industry?: string | null;
  talent_location?: string | null;
  talent_postcode?: string | null;
  talent_ir35_preference?: string | null;
  talent_rate_type?: string | null;
  talent_day_rate?: number | null;
  talent_hourly_rate?: number | null;
  talent_work_radius_miles?: number | null;
  talent_avatar_url?: string | null;
  talent_bio?: string | null;
  talent_cv_url?: string | null;
};

function extractDetail(text: string, status: number) {
  if (!text) return `STATUS ${status}: EMPTY`;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && "detail" in parsed) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = (parsed as any).detail;
      return typeof d === "string" ? d : JSON.stringify(d);
    }
  } catch {}
  return `STATUS ${status}: ${text}`;
}

function initials(name?: string | null) {
  const n = (name || "").trim();
  if (!n) return "??";
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function fmtMoney(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function scoreLabel(score: number) {
  if (score >= 70) return "Strong match";
  if (score >= 45) return "Good match";
  if (score >= 25) return "Possible match";
  return "Weak match";
}

function scorePillClass(score: number) {
  if (score >= 70) return "border-emerald-500/50 bg-emerald-950/30 text-emerald-200";
  if (score >= 45) return "border-purple-500/50 bg-purple-950/30 text-purple-200";
  if (score >= 25) return "border-amber-500/50 bg-amber-950/30 text-amber-200";
  return "border-neutral-700 bg-neutral-900 text-neutral-300";
}

export default function CompanyJobMatchesPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = typeof params?.id === "string" ? params.id : undefined;

  const [items, setItems] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (opts?: { silent?: boolean }) => {
    if (!jobId) return;

    try {
      if (opts?.silent) setRefreshing(true);
      else setLoading(true);

      setError(null);

      const res = await fetch(`/api/company/jobs/${jobId}/matches`, {
        cache: "no-store",
      });

      const text = await res.text();

      if (!res.ok) {
        setItems([]);
        setError(extractDetail(text, res.status));
        return;
      }

      const parsed = text ? JSON.parse(text) : [];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch (e: any) {
      setItems([]);
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_LOAD_MATCHES");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      setError("MISSING_JOB_ID");
      return;
    }
    load();
  }, [jobId]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => b.score - a.score);
  }, [items]);

  const strongMatches = useMemo(() => {
    return sortedItems.filter((item) => item.score >= 45);
  }, [sortedItems]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Search professionals</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Review matching professionals for this job before posting it to the marketplace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => load({ silent: true })}
            disabled={loading || refreshing}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900 disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/dashboard/company/jobs/${jobId}`)}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
          >
            ← Back to job
          </button>
        </div>
      </header>

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total matches" value={sortedItems.length} />
          <StatCard label="Strong matches" value={strongMatches.length} />
          <StatCard label="Job ready to post" value={1} />
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          Searching professionals...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {!loading && !error && sortedItems.length === 0 && (
        <div className="rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_40px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="border-b border-neutral-800/70 px-6 py-4">
            <h2 className="text-sm font-medium text-neutral-200">No suitable matches found</h2>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-neutral-400">
              No professionals currently match this job strongly enough. You can post the job to the marketplace so professionals can review it and apply.
            </p>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/company/jobs"
                className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
              >
                Edit jobs
              </Link>

              <Link
                href="/dashboard/company/jobs"
                className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40"
              >
                Post job to marketplace
              </Link>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && sortedItems.length > 0 && (
        <>
          <div className="space-y-4">
            {sortedItems.map((item) => {
              const reasons = Array.isArray(item.match_reasons) ? item.match_reasons : [];
              const rateLine = [
                item.talent_rate_type?.trim() ? item.talent_rate_type : null,
                item.talent_day_rate != null ? `Day ${fmtMoney(item.talent_day_rate)}` : null,
                item.talent_hourly_rate != null ? `Hour ${fmtMoney(item.talent_hourly_rate)}` : null,
              ]
                .filter(Boolean)
                .join(" • ");

              return (
                <div
                  key={item.talent_id}
                  className="rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_30px_rgba(0,0,0,0.4)] overflow-hidden"
                >
                  <div className="border-b border-neutral-800/70 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-neutral-200">
                        {item.talent_name || `Talent #${item.talent_id}`}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">
                        {[
                          item.talent_profession,
                          item.talent_engineering_discipline,
                          item.talent_industry,
                        ]
                          .filter(Boolean)
                          .join(" • ") || "Professional"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${scorePillClass(
                          item.score,
                        )}`}
                      >
                        {scoreLabel(item.score)} • {item.score}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 shrink-0 rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
                          {item.talent_avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.talent_avatar_url}
                              alt={item.talent_name ?? "Talent"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-purple-200">
                              {initials(item.talent_name)}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-neutral-300">
                            {[
                              item.talent_location,
                              item.talent_postcode,
                              item.talent_work_radius_miles != null
                                ? `${item.talent_work_radius_miles}mi radius`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" • ") || "Location not set"}
                          </div>

                          {rateLine ? (
                            <div className="text-xs text-neutral-500">{rateLine}</div>
                          ) : (
                            <div className="text-xs text-neutral-500">Rates not set</div>
                          )}

                          {item.talent_ir35_preference ? (
                            <div className="text-xs text-neutral-500">
                              IR35: {item.talent_ir35_preference}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/company/talent/${item.talent_id}`}
                          className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
                        >
                          View profile
                        </Link>

                        <button
                          type="button"
                          onClick={() => router.push(`/dashboard/company/jobs/${jobId}`)}
                          className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40"
                        >
                          Request to book
                        </button>
                      </div>
                    </div>

                    {reasons.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {reasons.map((reason, index) => (
                          <span
                            key={`${reason}-${index}`}
                            className="rounded-full border border-neutral-700 bg-neutral-900/70 px-3 py-1 text-[11px] text-neutral-300"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.talent_bio?.trim() && (
                      <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                          Bio
                        </p>
                        <p className="mt-1 text-sm text-neutral-200 whitespace-pre-wrap">
                          {item.talent_bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_30px_rgba(0,0,0,0.4)] overflow-hidden">
            <div className="border-b border-neutral-800/70 px-6 py-4">
              <h2 className="text-sm font-medium text-neutral-200">Not seeing the right people?</h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-neutral-400">
                You can still post this job to the marketplace and allow professionals to apply directly.
              </p>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/company/jobs"
                  className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
                >
                  Edit job
                </Link>

                <Link
                  href="/dashboard/company/jobs"
                  className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40"
                >
                  Post job to marketplace
                </Link>
              </div>
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
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-purple-300">{value}</p>
    </div>
  );
}