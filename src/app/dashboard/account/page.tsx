"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = {
  email?: string;
  role?: string;

  first_name?: string;
  last_name?: string;
  phone?: string;

  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  country?: string;

  company_name?: string | null;
  avatar_url?: string | null;
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

export default function MyAccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const text = await res.text();
        if (!res.ok) throw new Error(extractDetail(text, res.status));
        setMe(text ? (JSON.parse(text) as Me) : null);
      } catch (e: any) {
        setError(typeof e?.message === "string" ? e.message : "Failed to load account");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">My account</h1>
          <p className="text-sm text-neutral-400">
            View your account details.
          </p>
        </header>

        {loading && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-sm text-neutral-300">
            Loading…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap">
            {error}
          </div>
        )}

        {!loading && !error && me && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5 space-y-5">
            {/* Identity */}
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Email" value={me.email} />
              <Field label="Phone" value={me.phone} />
              <Field label="First name" value={me.first_name} />
              <Field label="Last name" value={me.last_name} />
            </div>

            {/* Address */}
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-neutral-500">
                Address
              </div>

              <Field label="Address line 1" value={me.address_line1} />
              <Field label="Address line 2" value={me.address_line2} />

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="City" value={me.city} />
                <Field label="Postcode" value={me.postcode} />
                <Field label="Country" value={me.country} />
              </div>
            </div>

            {/* Optional */}
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Company name"
                value={me.company_name ?? "—"}
                muted={!me.company_name}
              />
              <Field
                label="Avatar URL"
                value={me.avatar_url ?? "—"}
                muted={!me.avatar_url}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => router.push("/dashboard/account/edit")}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500"
              >
                Edit details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Field({
  label,
  value,
  muted,
}: {
  label: string;
  value?: string | null;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div
        className={`mt-1 text-sm ${
          muted ? "text-neutral-500 italic" : "text-neutral-100"
        }`}
      >
        {value || "—"}
      </div>
    </div>
  );
}