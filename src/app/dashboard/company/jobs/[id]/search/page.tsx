"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type MatchItem = {
  talent_id: number;
  score: number;
  match_reasons?: string[];

  talent_name?: string | null;

  talent_profession_category?: string | null;
  talent_profession?: string | null;
  talent_engineering_discipline?: string | null;
  talent_industry?: string | null;
  talent_experience_level?: string | null;

  talent_location?: string | null;
  talent_postcode?: string | null;
  talent_work_radius_miles?: number | null;

  talent_ir35_preference?: string | null;

  talent_rate_type?: string | null;
  talent_day_rate?: number | null;
  talent_hourly_rate?: number | null;

  talent_willing_to_travel?: boolean | null;
  talent_has_vehicle?: boolean | null;
  talent_has_tools?: boolean | null;

  talent_avatar_url?: string | null;
  talent_bio?: string | null;
  talent_cv_url?: string | null;
};

function extractDetail(text: string, status: number) {
  if (!text) return `STATUS ${status}: EMPTY`;

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && "detail" in parsed) {
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
  if (score >= 75) return "75%+ match";
  if (score >= 50) return "50% – 75% match";
  if (score >= 25) return "25% – 50% match";
  return "Below 25% match";
}

function scorePillClass(score: number) {
  if (score >= 75) return "border-emerald-500/50 bg-emerald-950/30 text-emerald-200";
  if (score >= 50) return "border-purple-500/50 bg-purple-950/30 text-purple-200";
  if (score >= 25) return "border-amber-500/50 bg-amber-950/30 text-amber-200";
  return "border-neutral-700 bg-neutral-900 text-neutral-300";
}

function formatRate(item: MatchItem) {
  const parts = [
    item.talent_rate_type?.trim() ? item.talent_rate_type : null,
    item.talent_day_rate != null ? `Day ${fmtMoney(item.talent_day_rate)}` : null,
    item.talent_hourly_rate != null ? `Hour ${fmtMoney(item.talent_hourly_rate)}` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" • ") : "Rates not set";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => b.score - a.score);
  }, [items]);

  const topMatches = useMemo(() => {
    return sortedItems.filter((item) => item.score >= 75);
  }, [sortedItems]);

  const goodMatches = useMemo(() => {
    return sortedItems.filter((item) => item.score >= 50 && item.score < 75);
  }, [sortedItems]);

  const possibleMatches = useMemo(() => {
    return sortedItems.filter((item) => item.score >= 25 && item.score < 50);
  }, [sortedItems]);

  const weakMatches = useMemo(() => {
    return sortedItems.filter((item) => item.score < 25);
  }, [sortedItems]);

  const cvMatches = useMemo(() => {
    return sortedItems.filter((item) => !!item.talent_cv_url).length;
  }, [sortedItems]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Search professionals
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Review structured talent matches grouped by match strength.
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
          <StatCard label="75%+ matches" value={topMatches.length} />
          <StatCard label="With CV uploaded" value={cvMatches} />
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
        <div className="overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
          <div className="border-b border-neutral-800/70 px-6 py-4">
            <h2 className="text-sm font-medium text-neutral-200">
              No suitable matches found
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-neutral-400">
              No professionals currently match this job strongly enough. Post the job to the marketplace so professionals can review it and apply.
            </p>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/company/jobs/${jobId}`}
                className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
              >
                Review job
              </Link>

              <Link
                href="/dashboard/company/jobs"
                className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40"
              >
                Back to jobs
              </Link>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && sortedItems.length > 0 && (
        <>
          <div className="space-y-6">
            <MatchGroup
              title="75% and above"
              description="Best-fit professionals based on discipline, role, rate, experience and requirements."
              items={topMatches}
              emptyText="No 75%+ matches found."
              jobId={jobId}
              router={router}
            />

            <MatchGroup
              title="50% – 75%"
              description="Good potential matches. Review the detail before requesting to book."
              items={goodMatches}
              emptyText="No 50% – 75% matches found."
              jobId={jobId}
              router={router}
            />

            <MatchGroup
              title="25% – 50%"
              description="Possible matches. These may need closer checking."
              items={possibleMatches}
              emptyText="No 25% – 50% matches found."
              jobId={jobId}
              router={router}
            />

            {weakMatches.length > 0 && (
              <MatchGroup
                title="Below 25%"
                description="Weak matches shown for transparency."
                items={weakMatches}
                emptyText="No weak matches."
                jobId={jobId}
                router={router}
              />
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
            <div className="border-b border-neutral-800/70 px-6 py-4">
              <h2 className="text-sm font-medium text-neutral-200">
                Not seeing the right people?
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-neutral-400">
                You can still post this job to the marketplace and allow professionals to apply directly.
              </p>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/company/jobs/${jobId}`}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900"
                >
                  Review job
                </Link>

                <Link
                  href="/dashboard/company/jobs"
                  className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40"
                >
                  Back to jobs
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MatchGroup({
  title,
  description,
  items,
  emptyText,
  jobId,
  router,
}: {
  title: string;
  description: string;
  items: MatchItem[];
  emptyText: string;
  jobId?: string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-950/50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/70 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100">{title}</h2>
          <p className="mt-1 text-xs text-neutral-500">{description}</p>
        </div>

        <span className="rounded-full border border-neutral-700 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-300">
          {items.length} result{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="space-y-4 p-4 md:p-6">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 px-4 py-5 text-sm text-neutral-500">
            {emptyText}
          </div>
        ) : (
          items.map((item) => (
            <MatchCard
              key={item.talent_id}
              item={item}
              jobId={jobId}
              router={router}
            />
          ))
        )}
      </div>
    </section>
  );
}

function MatchCard({
  item,
  jobId,
  router,
}: {
  item: MatchItem;
  jobId?: string;
  router: ReturnType<typeof useRouter>;
}) {
  const reasons = Array.isArray(item.match_reasons) ? item.match_reasons : [];
  const rateLine = formatRate(item);

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
      <div className="border-b border-neutral-800/70 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40">
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

            <div>
              <div className="text-sm font-semibold text-neutral-100">
                {item.talent_name || `Talent #${item.talent_id}`}
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                {[
                  item.talent_profession_category,
                  item.talent_profession,
                  item.talent_engineering_discipline,
                  item.talent_experience_level,
                  item.talent_industry,
                ]
                  .filter(Boolean)
                  .join(" • ") || "Professional"}
              </div>

              <div className="mt-2 text-xs text-neutral-400">
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
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${scorePillClass(
              item.score,
            )}`}
          >
            {scoreLabel(item.score)} • {item.score}%
          </span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <InfoBox label="Rate" value={rateLine} />
          <InfoBox label="IR35" value={item.talent_ir35_preference || "Not set"} />
          <InfoBox label="Experience" value={item.talent_experience_level || "Not set"} />
        </div>

        <div className="flex flex-wrap gap-2">
          <CapabilityPill
            label="Willing to travel"
            active={!!item.talent_willing_to_travel}
          />
          <CapabilityPill label="Own vehicle" active={!!item.talent_has_vehicle} />
          <CapabilityPill label="Own tools" active={!!item.talent_has_tools} />

          {item.talent_cv_url ? (
            <span className="rounded-full border border-emerald-500/40 bg-emerald-950/30 px-3 py-1 text-[11px] font-medium text-emerald-200">
              CV uploaded
            </span>
          ) : (
            <span className="rounded-full border border-neutral-700 bg-neutral-900/70 px-3 py-1 text-[11px] text-neutral-400">
              No CV
            </span>
          )}
        </div>

        {reasons.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Match reasons
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {reasons.map((reason, index) => (
                <span
                  key={`${reason}-${index}`}
                  className="rounded-full border border-purple-500/30 bg-purple-950/20 px-3 py-1 text-[11px] text-purple-200"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.talent_bio?.trim() && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Bio
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-200">
              {item.talent_bio}
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-800 pt-4">
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-neutral-200">{value}</p>
    </div>
  );
}

function CapabilityPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
        active
          ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
          : "border-neutral-700 bg-neutral-900/70 text-neutral-500"
      }`}
    >
      {label}: {active ? "Yes" : "No"}
    </span>
  );
}