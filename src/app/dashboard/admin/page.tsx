"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";

type AdminOverview = {
  total_users: number;
  users_active?: number;
  users_archived?: number;

  total_companies: number;
  companies_active?: number;
  companies_archived?: number;

  total_agencies: number;
  agencies_active?: number;
  agencies_archived?: number;

  total_talent: number;
  talent_active?: number;
  talent_archived?: number;

  total_jobs: number;
  jobs_active?: number;
  jobs_archived?: number;

  total_bookings?: number;
};

function qs(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/overview", { cache: "no-store" });
        const text = await res.text();

        if (!res.ok) {
          if (res.status === 401) {
            clearAuth();
            router.push("/login");
            return;
          }
          throw new Error(text || "Failed to load overview");
        }

        setData(text ? (JSON.parse(text) as AdminOverview) : null);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load admin overview");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const usersBase = "/dashboard/admin/users";
  const talentBase = "/dashboard/admin/talent";
  const jobsBase = "/dashboard/admin/jobs";

  const goUsers = (p?: Record<string, string | undefined>) =>
    router.push(`${usersBase}${qs(p ?? {})}`);
  const goTalent = (p?: Record<string, string | undefined>) =>
    router.push(`${talentBase}${qs(p ?? {})}`);
  const goJobs = (p?: Record<string, string | undefined>) =>
    router.push(`${jobsBase}${qs(p ?? {})}`);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          Loading…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-6 py-4 text-sm text-red-200">
          {error ?? "No data available"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Overview</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Platform-wide snapshot. Click any stat to drill down.
        </p>
      </header>

      {/* USERS */}
      <Section title="Users">
        <Stat label="Total users" value={data.total_users} onClick={() => goUsers()} />
        <Stat label="Active users" value={data.users_active} onClick={() => goUsers({ status: "active" })} />
        <Stat
          label="Archived users"
          value={data.users_archived}
          onClick={() => goUsers({ status: "archived" })}
        />
        <Stat label="Companies (total)" value={data.total_companies} onClick={() => goUsers({ role: "company" })} />
        <Stat label="Agencies (total)" value={data.total_agencies} onClick={() => goUsers({ role: "agency" })} />
      </Section>

      {/* USERS: role + status drilldown */}
      <Section title="Users by role">
        <Stat
          label="Companies · Active"
          value={data.companies_active}
          onClick={() => goUsers({ role: "company", status: "active" })}
        />
        <Stat
          label="Companies · Archived"
          value={data.companies_archived}
          onClick={() => goUsers({ role: "company", status: "archived" })}
        />
        <Stat
          label="Agencies · Active"
          value={data.agencies_active}
          onClick={() => goUsers({ role: "agency", status: "active" })}
        />
        <Stat
          label="Agencies · Archived"
          value={data.agencies_archived}
          onClick={() => goUsers({ role: "agency", status: "archived" })}
        />
      </Section>

      {/* TALENT */}
      <Section title="Talent">
        <Stat label="Total talent" value={data.total_talent} onClick={() => goTalent()} />
        <Stat label="Active" value={data.talent_active} onClick={() => goTalent({ status: "active" })} />
        <Stat label="Archived" value={data.talent_archived} onClick={() => goTalent({ status: "archived" })} />
      </Section>

      {/* JOBS */}
      <Section title="Jobs">
        <Stat label="Total jobs" value={data.total_jobs} onClick={() => goJobs()} />
        <Stat label="Active" value={data.jobs_active} onClick={() => goJobs({ status: "active" })} />
        <Stat label="Archived" value={data.jobs_archived} onClick={() => goJobs({ status: "archived" })} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">{title}</h2>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">{children}</div>
    </section>
  );
}

function Stat({
  label,
  value,
  onClick,
}: {
  label: string;
  value?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-2xl border border-neutral-800 bg-neutral-950/70 px-5 py-4 transition hover:border-purple-500/40 hover:bg-neutral-900"
    >
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-purple-300">{value ?? "—"}</p>
    </button>
  );
}