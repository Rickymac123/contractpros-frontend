"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function isEmailValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function MyAccountPage() {
  const router = useRouter();
  const redirectTimer = useRef<number | null>(null);

  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // editable fields
  const [email, setEmail] = useState("");
  const [emailDirty, setEmailDirty] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    setOk(null);

    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const text = await res.text();
      if (!res.ok) throw new Error(extractDetail(text, res.status));

      const data = text ? (JSON.parse(text) as Me) : null;
      setMe(data);

      setEmail(data?.email ?? "");
      setEmailDirty(false);

      setFirstName(data?.first_name ?? "");
      setLastName(data?.last_name ?? "");
      setPhone(data?.phone ?? "");

      setAddress1(data?.address_line1 ?? "");
      setAddress2(data?.address_line2 ?? "");
      setCity(data?.city ?? "");
      setPostcode(data?.postcode ?? "");
      setCountry(data?.country ?? "");

      setCompanyName(data?.company_name ?? "");
      setAvatarUrl(data?.avatar_url ?? "");
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Failed to load account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (redirectTimer.current) window.clearTimeout(redirectTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = useMemo(() => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (fn || ln) return `${fn} ${ln}`.trim();
    return email.trim() || "My account";
  }, [firstName, lastName, email]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setOk(null);

    try {
      const emailTrimmed = email.trim();

      // required fields (only company_name + avatar_url optional)
      if (!emailTrimmed) throw new Error("Email cannot be empty.");
      if (!isEmailValid(emailTrimmed)) throw new Error("Email format looks invalid.");

      if (!firstName.trim()) throw new Error("First name is required.");
      if (!lastName.trim()) throw new Error("Last name is required.");
      if (!phone.trim()) throw new Error("Phone number is required.");

      if (!address1.trim()) throw new Error("Address line 1 is required.");
      if (!city.trim()) throw new Error("City is required.");
      if (!postcode.trim()) throw new Error("Postcode is required.");
      if (!country.trim()) throw new Error("Country is required.");

      const payload: Record<string, unknown> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),

        address_line1: address1.trim(),
        address_line2: address2.trim(),
        city: city.trim(),
        postcode: postcode.trim(),
        country: country.trim(),

        company_name: companyName.trim() ? companyName.trim() : null,
        avatar_url: avatarUrl.trim() ? avatarUrl.trim() : null,
      };

      // only send email if it changed
      if (emailDirty && me?.email && emailTrimmed !== me.email) {
        payload.email = emailTrimmed;
      }

      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(extractDetail(text, res.status));

      setOk("Saved.");

      // Redirect back to read-only page after a short beat
      if (redirectTimer.current) window.clearTimeout(redirectTimer.current);
      redirectTimer.current = window.setTimeout(() => {
        router.replace("/dashboard/account");
        router.refresh();
      }, 700);
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">{displayName}</h1>
          <p className="text-sm text-neutral-400">Edit your account details.</p>
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

        {!loading && ok && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
            {ok} Redirecting…
          </div>
        )}

        {!loading && !error && me && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-neutral-500">Email</label>
                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailDirty(true);
                  }}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                  inputMode="email"
                  autoComplete="email"
                />
                {me.email && (
                  <p className="text-[11px] text-neutral-500">
                    Current: <span className="text-neutral-300">{me.email}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-neutral-500">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-neutral-500">First name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                  autoComplete="given-name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-neutral-500">Last name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-neutral-500">Address</div>

              <div className="space-y-2">
                <label className="text-[11px] text-neutral-500">Address line 1</label>
                <input
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                  autoComplete="address-line1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-neutral-500">Address line 2</label>
                <input
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                  autoComplete="address-line2"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-[11px] text-neutral-500">City</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                    autoComplete="address-level2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-neutral-500">Postcode</label>
                  <input
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                    autoComplete="postal-code"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-neutral-500">Country</label>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                    autoComplete="country-name"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-neutral-500">
                  Company name (optional)
                </label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-neutral-500">
                  Avatar URL (optional)
                </label>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-purple-500"
                  inputMode="url"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={load}
                disabled={saving}
                className="rounded-xl border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-xs text-neutral-300 transition hover:border-neutral-500 hover:bg-neutral-800 disabled:opacity-60"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>

            <div className="text-[11px] text-neutral-500">Password change: next step.</div>
          </div>
        )}
      </div>
    </div>
  );
}