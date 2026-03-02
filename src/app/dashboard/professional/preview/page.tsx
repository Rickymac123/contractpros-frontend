"use client";

import { useEffect, useMemo, useState } from "react";

type Review = {
  id: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
  reviewer_name?: string | null;
  reviewer_company?: string | null;
  reviewer_role?: string | null;
  created_at?: string | null;
  verified_at?: string | null;
  status?: string | null; // pending|verified|rejected
  is_public?: boolean;
};

type Profile = {
  id?: number;
  first_name?: string | null;
  last_name?: string | null;
  profession?: string | null;
  location?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  engineering_discipline?: string | null;
  industry?: string | null;
  ir35_preference?: string | null;
  rate_type?: string | null;
  day_rate?: number | null;
  hourly_rate?: number | null;
  work_radius_miles?: number | null;
};

type PreviewResponse = {
  profile?: Profile;
  reviews?: Review[];
  average_rating?: number;
  review_count?: number;
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

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function fmtMoney(n?: number | null) {
  if (n == null || Number.isNaN(Number(n))) return null;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" });
}

function StarRow({ value }: { value: number }) {
  const v = clamp(value, 0, 5);
  const full = Math.floor(v);
  const half = v - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  const star = (kind: "full" | "half" | "empty", i: number) => {
    const common = "h-4 w-4";
    if (kind === "full") {
      return (
        <svg key={`f-${i}`} viewBox="0 0 20 20" className={common} aria-hidden="true">
          <path
            fill="currentColor"
            d="M10 15.27l-5.18 3.05 1.39-5.98L1.64 7.98l6.07-.52L10 1.8l2.29 5.66 6.07.52-4.57 4.36 1.39 5.98z"
          />
        </svg>
      );
    }
    if (kind === "half") {
      return (
        <svg key={`h-${i}`} viewBox="0 0 20 20" className={common} aria-hidden="true">
          <defs>
            <linearGradient id={`half-${i}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.22)" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#half-${i})`}
            d="M10 15.27l-5.18 3.05 1.39-5.98L1.64 7.98l6.07-.52L10 1.8l2.29 5.66 6.07.52-4.57 4.36 1.39 5.98z"
          />
        </svg>
      );
    }
    return (
      <svg key={`e-${i}`} viewBox="0 0 20 20" className={common} aria-hidden="true">
        <path
          fill="rgba(255,255,255,0.22)"
          d="M10 15.27l-5.18 3.05 1.39-5.98L1.64 7.98l6.07-.52L10 1.8l2.29 5.66 6.07.52-4.57 4.36 1.39 5.98z"
        />
      </svg>
    );
  };

  return (
    <div className="flex items-center gap-1 text-purple-200">
      {Array.from({ length: full }).map((_, i) => star("full", i))}
      {half ? star("half", full) : null}
      {Array.from({ length: empty }).map((_, i) => star("empty", full + half + i))}
    </div>
  );
}

export default function ProfessionalPreviewPage() {
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/professional/me/preview", { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) {
        setData(null);
        setError(extractDetail(text, res.status));
        return;
      }

      const parsed = text ? (JSON.parse(text) as PreviewResponse) : {};
      setData(parsed ?? {});
    } catch (e: any) {
      setData(null);
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_LOAD");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const profile = data?.profile ?? {};
  const reviews = Array.isArray(data?.reviews) ? (data!.reviews as Review[]) : [];

  const verifiedReviews = useMemo(() => {
    // show verified/public only (safe default for “preview” that mirrors what a client sees)
    return reviews.filter((r) => (r.status ? r.status === "verified" : true) && (r.is_public ?? true));
  }, [reviews]);

  const computed = useMemo(() => {
    const count = data?.review_count ?? verifiedReviews.length;
    const avg =
      data?.average_rating ??
      (verifiedReviews.length
        ? verifiedReviews.reduce((s, r) => s + clamp(Number(r.rating) || 0, 0, 5), 0) / verifiedReviews.length
        : 0);

    return { count, avg: Math.round(avg * 10) / 10 };
  }, [data?.average_rating, data?.review_count, verifiedReviews]);

  const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Professional";

  const headlineBits = [
    profile.profession ? profile.profession : null,
    profile.location ? profile.location : null,
    profile.work_radius_miles != null ? `${profile.work_radius_miles}mi radius` : null,
  ].filter(Boolean);

  const rateBits = [
    profile.rate_type ? profile.rate_type : null,
    profile.day_rate != null ? `Day: ${fmtMoney(profile.day_rate)}` : null,
    profile.hourly_rate != null ? `Hour: ${fmtMoney(profile.hourly_rate)}` : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Preview profile</h1>
          <p className="mt-1 text-sm text-neutral-400">
            This is how clients will see your profile (only verified public reviews are shown).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </header>

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
          {/* Top profile card */}
          <div className="rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_40px_rgba(0,0,0,0.55)] overflow-hidden">
            <div className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-200">Profile</h2>
              <div className="flex items-center gap-2">
                <StarRow value={computed.avg} />
                <div className="text-xs text-neutral-300">
                  <span className="font-semibold text-white">{computed.avg.toFixed(1)}</span>
                  <span className="text-neutral-500"> / 5</span>
                  <span className="mx-2 text-neutral-700">•</span>
                  <span className="text-neutral-400">{computed.count} reviews</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-32 w-32 rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shrink-0">
                    {/* Use <img> to avoid next/image remote domain config crashes */}
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt="Profile photo"
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-neutral-500 text-xs">No photo</div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-white">{fullName}</div>
                    {headlineBits.length ? (
                      <div className="text-sm text-neutral-400">{headlineBits.join(" • ")}</div>
                    ) : (
                      <div className="text-sm text-neutral-500">Add profession/location to improve your profile.</div>
                    )}
                    {rateBits.length ? <div className="text-xs text-neutral-500">{rateBits.join(" • ")}</div> : null}
                  </div>
                </div>

                <div className="grid gap-2 md:text-right">
                  <MetaPill label="Discipline" value={profile.engineering_discipline} />
                  <MetaPill label="Industry" value={profile.industry} />
                  <MetaPill label="IR35" value={profile.ir35_preference} />
                </div>
              </div>

              {profile.bio ? (
                <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
                  <div className="text-xs font-medium text-neutral-300">Bio</div>
                  <div className="mt-2 text-sm text-neutral-200 whitespace-pre-wrap">{profile.bio}</div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Reviews */}
          <div className="rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_40px_rgba(0,0,0,0.55)] overflow-hidden">
            <div className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-200">Reviews</h2>
              <div className="text-xs text-neutral-500">Showing verified public reviews</div>
            </div>

            <div className="p-6">
              {verifiedReviews.length === 0 ? (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 px-6 py-10 text-center text-sm text-neutral-400">
                  No verified reviews yet.
                </div>
              ) : (
                <div className="grid gap-4">
                  {verifiedReviews
                    .slice()
                    .sort((a, b) => {
                      const da = new Date(a.verified_at || a.created_at || 0).getTime();
                      const db = new Date(b.verified_at || b.created_at || 0).getTime();
                      return db - da;
                    })
                    .map((r) => (
                      <div
                        key={r.id}
                        className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 hover:bg-neutral-950/55 transition"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <StarRow value={clamp(Number(r.rating) || 0, 0, 5)} />
                              <div className="text-xs text-neutral-400">{fmtDate(r.verified_at || r.created_at)}</div>
                            </div>

                            <div className="text-sm font-semibold text-white">
                              {r.title?.trim() ? r.title : "Review"}
                            </div>

                            {r.comment?.trim() ? (
                              <div className="text-sm text-neutral-200 whitespace-pre-wrap">{r.comment}</div>
                            ) : null}
                          </div>

                          <div className="md:text-right text-xs text-neutral-400">
                            <div className="text-neutral-200 font-medium">{r.reviewer_name || "Verified reviewer"}</div>
                            <div className="text-neutral-500">
                              {[r.reviewer_role, r.reviewer_company].filter(Boolean).join(" • ")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="inline-flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="text-[11px] font-medium text-neutral-200">{value?.trim() ? value : "—"}</div>
    </div>
  );
}