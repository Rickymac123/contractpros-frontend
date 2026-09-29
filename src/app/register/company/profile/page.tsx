"use client";

import { useEffect, useMemo, useState } from "react";

type CompanyProfile = {
  id?: number;

  name?: string | null;
  website?: string | null;
  postcode?: string | null;
  location?: string | null;

  logo_url?: string | null;
  description?: string | null;
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

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // form
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [postcode, setPostcode] = useState("");
  const [location, setLocation] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");

  const hasProfile = useMemo(() => !!profile?.id, [profile]);
  const busy = saving || uploadingLogo;

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setInfo(null);

      // GET /api/company/me  -> backend GET /companies/me
      const res = await fetch("/api/company/me", { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) {
        if (res.status === 404) {
          setProfile(null);
          setName("");
          setWebsite("");
          setPostcode("");
          setLocation("");
          setLogoUrl("");
          setDescription("");
          return;
        }
        setError(extractDetail(text, res.status));
        return;
      }

      const data = text ? (JSON.parse(text) as CompanyProfile) : null;
      setProfile(data);

      setName((data?.name ?? "") as string);
      setWebsite((data?.website ?? "") as string);
      setPostcode((data?.postcode ?? "") as string);
      setLocation((data?.location ?? "") as string);
      setLogoUrl((data?.logo_url ?? "") as string);
      setDescription((data?.description ?? "") as string);
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_LOAD_COMPANY_PROFILE");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadLogo = async (file: File) => {
    setUploadingLogo(true);
    setError(null);
    setInfo(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      // POST /api/uploads/company-logo -> backend POST /uploads/company-logo
      const res = await fetch("/api/uploads/company-logo", {
        method: "POST",
        body: fd,
      });

      const text = await res.text();
      if (!res.ok) {
        setError(extractDetail(text, res.status));
        return;
      }

      const data = text ? JSON.parse(text) : null;
      const url = data?.url as string | undefined;

      if (!url) {
        setError("UPLOAD_SUCCEEDED_BUT_NO_URL_RETURNED");
        return;
      }

      setLogoUrl(url);
      setInfo("Logo uploaded (remember to save changes)");
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_UPLOAD_LOGO");
    } finally {
      setUploadingLogo(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setInfo(null);

    try {
      if (!name.trim()) {
        setError("COMPANY_NAME_REQUIRED");
        return;
      }
      if (!postcode.trim()) {
        setError("POSTCODE_REQUIRED");
        return;
      }

      const payload = {
        name: name.trim(),
        website: website.trim() || null,
        postcode: postcode.trim(),
        location: location.trim() || null,
        logo_url: logoUrl.trim() || null,
        description: description.trim() || null,
      };

      if (!hasProfile) {
        // POST /api/company -> backend POST /companies/
        const res = await fetch("/api/company", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        if (!res.ok) {
          setError(extractDetail(text, res.status));
          return;
        }
        setInfo("Company profile created");
        await load();
        return;
      }

      // PATCH /api/company/me -> backend PATCH /companies/me
      const res = await fetch("/api/company/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) {
        setError(extractDetail(text, res.status));
        return;
      }

      setInfo("Company profile saved");
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Company profile</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {hasProfile ? "Update your company profile." : "Create your company profile."}
          </p>
        </div>
      </header>

      {loading && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          Loading…
        </div>
      )}

      {!loading && info && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
          {info}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {!loading && (
        <div className="rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_40px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="border-b border-neutral-800/80 px-6 py-4">
            <h2 className="text-sm font-medium text-neutral-200">Company details</h2>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Logo */}
            <div className="flex flex-wrap items-start gap-4">
              <div className="shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Company logo"
                    className="h-16 w-16 rounded-2xl border border-neutral-800 object-cover bg-white"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl border border-purple-500/40 bg-purple-950/30 flex items-center justify-center">
                    <span className="text-xs font-semibold text-purple-200">No logo</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="text-xs font-medium text-neutral-300">Company logo</div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadLogo(f);
                      e.currentTarget.value = "";
                    }}
                    className="block w-full max-w-sm text-xs text-neutral-200
                      file:mr-3 file:rounded-xl file:border file:border-neutral-800
                      file:bg-neutral-950/60 file:px-3 file:py-2 file:text-xs file:text-neutral-200
                      hover:file:bg-neutral-900"
                  />
                  {uploadingLogo && <span className="text-xs text-neutral-400">Uploading…</span>}
                </div>

                {logoUrl && <div className="text-xs text-neutral-500 break-all">{logoUrl}</div>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company name *">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="e.g. Demo Company Ltd"
                />
              </Field>

              <Field label="Website">
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="e.g. https://example.com"
                />
              </Field>

              <Field label="Postcode *">
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="e.g. LN1 1AA"
                />
              </Field>

              <Field label="Location (optional)">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="e.g. Londn"
                />
              </Field>
            </div>

            <Field label="About the company">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                placeholder="Brief description of what you do…"
              />
            </Field>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={load}
                disabled={busy}
                className="rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-2 text-xs text-neutral-200 transition hover:bg-neutral-900 disabled:opacity-60"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={save}
                disabled={busy}
                className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:opacity-60"
              >
                {saving ? "Saving…" : hasProfile ? "Save changes" : "Create profile"}
              </button>
            </div>

            <div className="text-[11px] text-neutral-500">Fields marked * are required.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-neutral-300">{label}</div>
      {children}
    </div>
  );
}