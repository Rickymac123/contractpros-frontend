// src/app/dashboard/company/jobs/new/page.tsx
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function NewJobPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    location: "",
    profession: "",
    day_rate_min: "",
    day_rate_max: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: form.title.trim(),
        location: form.location.trim(),
        profession: form.profession.trim(),
        day_rate_min: Number(form.day_rate_min) || 0,
        day_rate_max: Number(form.day_rate_max) || 0,
        description: form.description.trim() || null,
      };

      await axios.post("/api/company/jobs", payload);

      router.push("/dashboard/company/jobs");
      router.refresh();
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ?? err?.message ?? "Failed to create job";
      setError(String(detail));
    } finally {
      setSaving(false);
    }
  };

  // Flattened: remove per-page bg/min-h-screen/gradient shells. Layout owns that.
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create job</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Add a new role to your active job listings.
          </p>
        </div>

        <Link
          href="/dashboard/company/jobs"
          className="rounded-xl border border-neutral-700 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-300 transition hover:border-neutral-500 hover:bg-neutral-900"
        >
          ← Back
        </Link>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/70">
        <div className="border-b border-neutral-800/80 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            New job
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            RMC – Contract &amp; Interim Talent
          </p>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Job title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Maintenance Engineer (Nights)"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Location
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Merthyr Tydfil, South Wales"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Profession
                </label>
                <input
                  name="profession"
                  value={form.profession}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Maintenance Engineer"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Day rate (min)
                </label>
                <input
                  type="number"
                  name="day_rate_min"
                  value={form.day_rate_min}
                  onChange={handleChange}
                  required
                  placeholder="550"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Day rate (max)
                </label>
                <input
                  type="number"
                  name="day_rate_max"
                  value={form.day_rate_max}
                  onChange={handleChange}
                  required
                  placeholder="650"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Description{" "}
                <span className="ml-2 text-[10px] font-medium tracking-normal text-neutral-500">
                  optional
                </span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                placeholder="Key responsibilities, shift patterns, technology stack, IR35 status etc."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                <p className="font-medium">There was a problem</p>
                <p className="mt-1 break-all text-xs text-red-200/80">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-500"
              >
                {saving ? "Creating…" : "Create job"}
              </button>

              <Link
                href="/dashboard/company/jobs"
                className="text-xs text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}