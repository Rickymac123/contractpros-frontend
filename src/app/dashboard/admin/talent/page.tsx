"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Talent = {
  id: number;
  full_name: string;
  profession: string;
  location: string;
  day_rate: number;
  agency_id: number;

  // optional flags (depending on your backend model)
  is_archived?: boolean | null;
  is_active?: boolean | null;
};

type AdminUser = {
  id: string | number;
  email: string;
  role?: string | null;
  company_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

function norm(v: unknown) {
  return String(v ?? "").toLowerCase().trim();
}

function extractDetail(text: string, status: number) {
  if (!text) return `STATUS ${status}: EMPTY`;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && "detail" in parsed) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detail = (parsed as any).detail;
      return typeof detail === "string" ? detail : JSON.stringify(detail);
    }
  } catch {}
  return `STATUS ${status}: ${text}`;
}

function isArchived(t: Talent) {
  // support either convention:
  //  - is_archived: true
  //  - is_active: false
  if (t.is_archived === true) return true;
  if (t.is_active === false) return true;
  return false;
}

export default function AdminTalentPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const initialQ = sp?.get("q") ?? "";
  const initialStatus = (sp?.get("status") ?? "all") as
    | "all"
    | "active"
    | "archived";

  const [talent, setTalent] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // agency lookup (agency_id -> label)
  const [agencyLabelById, setAgencyLabelById] = useState<Record<string, string>>(
    {},
  );

  // filters
  const [query, setQuery] = useState(initialQ);
  const [status, setStatus] = useState<"all" | "active" | "archived">(
    initialStatus === "active" || initialStatus === "archived"
      ? initialStatus
      : "all",
  );

  const syncUrl = (next: { q?: string; status?: string }) => {
    const params = new URLSearchParams(sp?.toString() ?? "");
    if (next.q !== undefined) {
      const q = next.q.trim();
      if (q) params.set("q", q);
      else params.delete("q");
    }
    if (next.status !== undefined) {
      if (next.status && next.status !== "all") params.set("status", next.status);
      else params.delete("status");
    }
    const qs = params.toString();
    router.replace(qs ? `/dashboard/admin/talent?${qs}` : "/dashboard/admin/talent");
  };

  const loadAgencies = async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) return;

      const text = await res.text();
      const users = text ? (JSON.parse(text) as AdminUser[]) : [];
      if (!Array.isArray(users)) return;

      const map: Record<string, string> = {};
      for (const u of users) {
        if (u.role !== "agency") continue;

        const id = String(u.id);
        const label =
          (u.company_name && u.company_name.trim()) ||
          (u.first_name || u.last_name
            ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
            : "") ||
          u.email ||
          `Agency #${id}`;

        map[id] = label;
      }
      setAgencyLabelById(map);
    } catch {
      // ignore
    }
  };

  const loadTalent = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/talent", { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) throw new Error(extractDetail(text, res.status));

      const parsed = text ? JSON.parse(text) : [];
      setTalent(Array.isArray(parsed) ? parsed : []);
    } catch (err: any) {
      setError(typeof err?.message === "string" ? err.message : "Failed to load talent");
    } finally {
      setLoading(false);
    }
  };

  const load = async () => {
    await Promise.all([loadAgencies(), loadTalent()]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = norm(query);

    return talent
      .filter((t) => {
        const archived = isArchived(t);
        if (status === "active" && archived) return false;
        if (status === "archived" && !archived) return false;
        return true;
      })
      .filter((t) => {
        if (!q) return true;

        const agencyId = String(t.agency_id ?? "");
        const agencyLabel = agencyLabelById[agencyId] ?? "";

        const haystack = [
          t.full_name,
          t.profession,
          t.location,
          agencyLabel,
          agencyId,
        ]
          .map(norm)
          .join(" ");

        return haystack.includes(q);
      });
  }, [talent, query, status, agencyLabelById]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin · Talent</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Every talent profile across all agencies.
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          className="rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-1.5 text-xs text-neutral-200 transition hover:bg-neutral-800"
        >
          ← Back
        </Link>
      </header>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <input
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              syncUrl({ q: v });
            }}
            placeholder="Search name, profession, location, agency…"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              const v = e.target.value as any;
              setStatus(v);
              syncUrl({ status: v });
            }}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <button
            type="button"
            onClick={load}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 transition hover:bg-neutral-900"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          Loading talent…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          No talent match your filters.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((t) => {
            const archived = isArchived(t);
            const agencyId = String(t.agency_id ?? "");
            const agencyLabel =
              agencyLabelById[agencyId] || `Agency #${agencyId || "—"}`;

            return (
              <div
                key={t.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-100">
                        {t.full_name}
                      </p>
                      {archived && (
                        <span className="rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[11px] text-neutral-200">
                          Archived
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-neutral-400">
                      <span className="text-neutral-300">{agencyLabel}</span>
                      {" · "}
                      {t.profession} · {t.location}
                    </p>
                  </div>

                  <div className="text-right text-xs text-neutral-400">
                    £{t.day_rate}/day
                  </div>
                </div>

                <p className="mt-2 text-xs text-neutral-500">
                  Talent #{t.id} · Agency #{t.agency_id}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}