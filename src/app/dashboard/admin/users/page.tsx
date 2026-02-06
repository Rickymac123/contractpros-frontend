"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type AdminUser = {
  id: string;
  email: string;
  role?: string | null;

  first_name?: string | null;
  last_name?: string | null;

  is_active?: boolean | null;
};

type Me = {
  id?: string;
};

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

function norm(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [meId, setMeId] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // NEW: UI state controlled by URL
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "company" | "agency" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");

  // read params on mount + when URL changes
  useEffect(() => {
    const role = (searchParams.get("role") ?? "all").toLowerCase();
    const status = (searchParams.get("status") ?? "all").toLowerCase();
    const query = searchParams.get("q") ?? "";

    setRoleFilter(
      role === "company" || role === "agency" || role === "admin" ? (role as any) : "all",
    );
    setStatusFilter(status === "active" || status === "archived" ? (status as any) : "all");
    setQ(query);
  }, [searchParams]);

  const setUrlParams = (next: { role?: string; status?: string; q?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (next.role !== undefined) {
      if (!next.role || next.role === "all") params.delete("role");
      else params.set("role", next.role);
    }

    if (next.status !== undefined) {
      if (!next.status || next.status === "all") params.delete("status");
      else params.set("status", next.status);
    }

    if (next.q !== undefined) {
      const v = next.q.trim();
      if (!v) params.delete("q");
      else params.set("q", v);
    }

    const qs = params.toString();
    router.replace(qs ? `/dashboard/admin/users?${qs}` : "/dashboard/admin/users");
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    setOk(null);

    try {
      // who am I (used to prevent self-archive)
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (meRes.ok) {
          const me = (await meRes.json()) as Me;
          setMeId(typeof me?.id === "string" ? me.id : String(me?.id ?? ""));
        }
      } catch {
        // ignore
      }

      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) {
        setError(text || `STATUS ${res.status}`);
        return;
      }

      const data = text ? JSON.parse(text) : [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleArchive = async (u: AdminUser) => {
    if (!u?.id) return;
    if (meId && String(u.id) === String(meId)) {
      setError("You cannot archive/unarchive your own admin account.");
      return;
    }

    const nextActive = !(u.is_active ?? true);
    const label = nextActive ? "Unarchive (activate)" : "Archive (disable)";

    const confirmed = window.confirm(
      `${label} this user?\n\n${u.email}\n\nThis toggles is_active.`,
    );
    if (!confirmed) return;

    setBusyId(u.id);
    setError(null);
    setOk(null);

    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nextActive }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(extractDetail(text, res.status));

      setOk(nextActive ? "User unarchived." : "User archived.");
      await load();
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Failed to update user");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const query = norm(q);

    return users.filter((u) => {
      const active = u.is_active ?? true;
      const statusOk =
        statusFilter === "all" ? true : statusFilter === "active" ? active : !active;

      const role = (u.role ?? "").toLowerCase();
      const roleOk = roleFilter === "all" ? true : role === roleFilter;

      if (!statusOk || !roleOk) return false;

      if (!query) return true;

      const fullName = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
      const hay = `${u.email ?? ""} ${u.id ?? ""} ${u.role ?? ""} ${fullName}`.toLowerCase();
      return hay.includes(query);
    });
  }, [users, q, roleFilter, statusFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin · Users</h1>
        <p className="text-sm text-neutral-400">All platform users.</p>
      </header>

      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              setQ(v);
              setUrlParams({ q: v });
            }}
            placeholder="Search email, name, role, id…"
            className="w-full md:w-80 rounded-xl border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-purple-500"
          />

          <select
            value={roleFilter}
            onChange={(e) => {
              const v = e.target.value as any;
              setRoleFilter(v);
              setUrlParams({ role: v });
            }}
            className="w-full md:w-44 rounded-xl border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-purple-500"
          >
            <option value="all">All roles</option>
            <option value="company">Companies</option>
            <option value="agency">Agencies</option>
            <option value="admin">Admins</option>
            <option value="admin"></option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              const v = e.target.value as any;
              setStatusFilter(v);
              setUrlParams({ status: v });
            }}
            className="w-full md:w-44 rounded-xl border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-purple-500"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="text-xs text-neutral-500">
          Showing <span className="text-neutral-200">{filtered.length}</span> of{" "}
          <span className="text-neutral-200">{users.length}</span>
        </div>
      </div>

      {loading && <p className="text-sm text-neutral-400">Loading…</p>}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {!loading && ok && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
          {ok}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/60">
          <div className="grid grid-cols-12 gap-3 border-b border-neutral-800 px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
            <div className="col-span-3">Email</div>
            <div className="col-span-2">First name</div>
            <div className="col-span-2">Last name</div>
            <div className="col-span-1">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-neutral-800">
            {filtered.map((u) => {
              const active = u.is_active ?? true;
              const isMe = meId && String(u.id) === String(meId);
              const busy = busyId === u.id;

              return (
                <div
                  key={u.id}
                  className="grid grid-cols-12 gap-3 px-4 py-3 text-sm items-center"
                >
                  <div className="col-span-3 text-neutral-100 truncate">{u.email}</div>
                  <div className="col-span-2 text-neutral-300 truncate">{u.first_name ?? "—"}</div>
                  <div className="col-span-2 text-neutral-300 truncate">{u.last_name ?? "—"}</div>
                  <div className="col-span-1 text-neutral-300">{u.role ?? "—"}</div>

                  <div className="col-span-2 text-neutral-300">
                    {active ? "Active" : "Archived"}
                    {isMe ? <span className="ml-2 text-[11px] text-neutral-500">(you)</span> : null}
                  </div>

                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => toggleArchive(u)}
                      disabled={busy || isMe}
                      className="rounded-lg border border-neutral-700 bg-neutral-900/70 px-2.5 py-1 text-xs text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800 disabled:opacity-60"
                      title={active ? "Archive user" : "Unarchive user"}
                    >
                      {busy ? "Working…" : active ? "Archive" : "Unarchive"}
                    </button>

                    <Link
                      href={`/dashboard/admin/users/${u.id}/edit`}
                      className="rounded-lg border border-neutral-700 bg-neutral-900/70 px-2.5 py-1 text-xs text-neutral-200 transition hover:border-purple-500/60 hover:bg-neutral-800"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-neutral-400">
                No users match your filters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}