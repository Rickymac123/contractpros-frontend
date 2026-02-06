// src/app/dashboard/admin/users/[id]/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type AdminUser = {
  id: string;
  email: string;
  role?: string | null; // "company" | "agency" | "admin"
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
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
  } catch {
    // ignore
  }
  return `STATUS ${status}: ${text}`;
}

export default function AdminEditUserPage() {
  const params = useParams();
  const router = useRouter();

  const idParam = params?.id;
  const userId = useMemo(() => {
    const raw = Array.isArray(idParam) ? idParam[0] : idParam;
    return typeof raw === "string" ? raw : "";
  }, [idParam]);

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Editable fields
  const [role, setRole] = useState<"company" | "agency" | "admin">("company");
  const [isActive, setIsActive] = useState(true);

  // Email editing
  const [email, setEmail] = useState("");
  const [emailDirty, setEmailDirty] = useState(false);

  const load = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    setOk(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) throw new Error(extractDetail(text, res.status));

      const data = text ? (JSON.parse(text) as AdminUser) : null;
      setUser(data);

      const initialRole =
        (data?.role as any) === "agency" || (data?.role as any) === "admin"
          ? (data?.role as any)
          : "company";

      setRole(initialRole);
      setIsActive(data?.is_active ?? true);

      setEmail(data?.email ?? "");
      setEmailDirty(false);
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("MISSING_USER_ID");
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const archiveToggle = async () => {
    if (!userId) return;

    setSaving(true);
    setError(null);
    setOk(null);

    try {
      const nextActive = !isActive;
      const action = nextActive ? "Unarchive (reactivate)" : "Archive (disable)";

      const confirmed = window.confirm(
        `${action} this account?\n\nThis will ${nextActive ? "allow" : "prevent"} the user from signing in.`
      );
      if (!confirmed) {
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nextActive }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(extractDetail(text, res.status));

      setIsActive(nextActive);
      setOk(nextActive ? "Account reactivated." : "Account archived (disabled).");
      await load();
      router.refresh();
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!userId) return;

    setSaving(true);
    setError(null);
    setOk(null);

    try {
      const emailTrimmed = email.trim();

      if (!emailTrimmed) throw new Error("Email cannot be empty.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        throw new Error("Email format looks invalid.");
      }

      const currentEmail = (user?.email ?? "").trim();
      const emailChanged = emailDirty && emailTrimmed !== currentEmail;

      if (emailChanged) {
        const ok = window.confirm(
          `Change email from "${currentEmail}" to "${emailTrimmed}"?\n\nThis affects how the user logs in.`
        );
        if (!ok) {
          setSaving(false);
          return;
        }
      }

      const payload: Record<string, unknown> = { role };

      if (emailChanged) payload.email = emailTrimmed;

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(extractDetail(text, res.status));

      setOk("Saved.");
      await load();
      router.refresh();
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Edit user</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Change email, role and archive/unarchive the account.
            </p>
          </div>

          <Link
            href="/dashboard/admin/users"
            className="rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-1.5 text-xs text-neutral-200 transition hover:bg-neutral-800"
          >
            ← Back
          </Link>
        </header>

        {loading && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-sm text-neutral-300">
            Loading user…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap">
            {error}
          </div>
        )}

        {!loading && ok && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
            {ok}
          </div>
        )}

        {!loading && !error && user && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5 space-y-5">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-neutral-500">User</div>
              <div className="text-xs text-neutral-500">User ID: {user.id}</div>
            </div>

            {/* Email editor */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-neutral-500">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailDirty(true);
                }}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                placeholder="name@domain.com"
                inputMode="email"
                autoComplete="off"
              />
              <p className="text-[11px] text-neutral-500">
                Current: <span className="text-neutral-300">{user.email}</span>
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-neutral-500">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                >
                  <option value="company">company</option>
                  <option value="agency">agency</option>
                  <option value="admin">admin</option>
                </select>
                <p className="text-[11px] text-neutral-500">
                  Setting role to <span className="text-neutral-300">admin</span> is your
                  app role, not necessarily superuser.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-neutral-500">
                  Account status
                </label>

                <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200">
                  {isActive ? "Active" : "Archived (disabled)"}
                </div>

                <button
                  type="button"
                  onClick={archiveToggle}
                  disabled={saving}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition disabled:opacity-60 ${
                    isActive
                      ? "border-red-500/40 bg-red-950/20 text-red-200 hover:bg-red-950/35"
                      : "border-emerald-500/30 bg-emerald-950/15 text-emerald-200 hover:bg-emerald-950/25"
                  }`}
                >
                  {isActive ? "Archive account" : "Unarchive account"}
                </button>

                <div className="text-[11px] text-neutral-500">
                  Current flags:{" "}
                  <span className="text-neutral-300">
                    verified={String(!!user.is_verified)} · superuser={String(!!user.is_superuser)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => router.push("/dashboard/admin/users")}
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}