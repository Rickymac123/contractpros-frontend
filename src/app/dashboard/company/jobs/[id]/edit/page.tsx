"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Job = {
  id: number;
  title: string;
  description?: string | null;

  profession_category?: string | null;
  profession?: string | null;
  engineering_discipline?: string | null;
  industry?: string | null;

  location?: string | null;
  postcode?: string | null;
  work_radius_miles?: number | null;
  site_name?: string | null;
  site_address?: string | null;

  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  shift_pattern?: string | null;

  rate_type?: string | null;
  day_rate_min?: number | null;
  day_rate_max?: number | null;
  hourly_rate_min?: number | null;
  hourly_rate_max?: number | null;
  ir35_type?: string | null;

  required_skills?: string | null;
  preferred_skills?: string | null;
  required_qualifications?: string | null;
  experience_level?: string | null;

  contract_type?: string | null;
  is_urgent?: boolean | null;
  requires_travel?: boolean | null;
  requires_vehicle?: boolean | null;
  requires_own_tools?: boolean | null;

  is_archived?: boolean;
};

type FormState = {
  title: string;
  description: string;

  profession_category: string;
  profession: string;
  engineering_discipline: string;
  industry: string;

  location: string;
  postcode: string;
  work_radius_miles: string;
  site_name: string;
  site_address: string;

  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  shift_pattern: string;

  rate_type: string;
  day_rate_min: string;
  day_rate_max: string;
  hourly_rate_min: string;
  hourly_rate_max: string;
  ir35_type: string;

  required_skills: string;
  preferred_skills: string;
  required_qualifications: string;
  experience_level: string;

  contract_type: string;
  is_urgent: boolean;
  requires_travel: boolean;
  requires_vehicle: boolean;
  requires_own_tools: boolean;
};

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params?.id === "string" ? params.id : undefined;

  const [job, setJob] = useState<Job | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",

    profession_category: "Engineering",
    profession: "Engineer",
    engineering_discipline: "",
    industry: "",

    location: "",
    postcode: "",
    work_radius_miles: "",
    site_name: "",
    site_address: "",

    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    shift_pattern: "",

    rate_type: "day",
    day_rate_min: "",
    day_rate_max: "",
    hourly_rate_min: "",
    hourly_rate_max: "",
    ir35_type: "",

    required_skills: "",
    preferred_skills: "",
    required_qualifications: "",
    experience_level: "",

    contract_type: "",
    is_urgent: false,
    requires_travel: false,
    requires_vehicle: false,
    requires_own_tools: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toNumberOrNull = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const normalizeDate = (value?: string | null) => {
    if (!value) return "";
    return String(value).slice(0, 10);
  };

  const normalizeTime = (value?: string | null) => {
    if (!value) return "";
    return String(value).slice(0, 5);
  };

  const fetchJob = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/company/jobs/${jobId}`);
      const text = await res.text();

      if (!res.ok) {
        setError(
          `JOB_FETCH_STATUS_${res.status}: ${text || "EMPTY_RESPONSE_FROM_API"}`,
        );
        return;
      }

      let parsed: any;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        setError("FAILED_TO_PARSE_JOB_RESPONSE");
        return;
      }

      const jobData =
        parsed && typeof parsed === "object" && "job" in parsed ? parsed.job : parsed;

      if (!jobData || typeof jobData !== "object") {
        setError("INVALID_JOB_PAYLOAD");
        return;
      }

      const j = jobData as Job;
      setJob(j);

      setForm({
        title: j.title || "",
        description: j.description || "",

        profession_category: j.profession_category || "Engineering",
        profession: j.profession || "Engineer",
        engineering_discipline: j.engineering_discipline || "",
        industry: j.industry || "",

        location: j.location || "",
        postcode: j.postcode || "",
        work_radius_miles:
          j.work_radius_miles != null ? String(j.work_radius_miles) : "",
        site_name: j.site_name || "",
        site_address: j.site_address || "",

        start_date: normalizeDate(j.start_date),
        end_date: normalizeDate(j.end_date),
        start_time: normalizeTime(j.start_time),
        end_time: normalizeTime(j.end_time),
        shift_pattern: j.shift_pattern || "",

        rate_type: j.rate_type || "day",
        day_rate_min: j.day_rate_min != null ? String(j.day_rate_min) : "",
        day_rate_max: j.day_rate_max != null ? String(j.day_rate_max) : "",
        hourly_rate_min:
          j.hourly_rate_min != null ? String(j.hourly_rate_min) : "",
        hourly_rate_max:
          j.hourly_rate_max != null ? String(j.hourly_rate_max) : "",
        ir35_type: j.ir35_type || "",

        required_skills: j.required_skills || "",
        preferred_skills: j.preferred_skills || "",
        required_qualifications: j.required_qualifications || "",
        experience_level: j.experience_level || "",

        contract_type: j.contract_type || "",
        is_urgent: !!j.is_urgent,
        requires_travel: !!j.requires_travel,
        requires_vehicle: !!j.requires_vehicle,
        requires_own_tools: !!j.requires_own_tools,
      });
    } catch (err: any) {
      setError(
        typeof err?.message === "string" ? err.message : "UNKNOWN_JOB_FETCH_ERROR",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) {
      setError("MISSING_JOB_ID");
      setLoading(false);
      return;
    }
    fetchJob();
  }, [jobId]);

  const handleCancel = () => {
    if (!jobId) router.push("/dashboard/company/jobs");
    else router.push(`/dashboard/company/jobs/${jobId}`);
  };

  const handleRestore = async () => {
    if (!jobId || restoring) return;

    try {
      setRestoring(true);
      setError(null);

      const res = await fetch(`/api/company/jobs/${jobId}/restore`, {
        method: "POST",
      });
      const text = await res.text();

      if (!res.ok) {
        setError(
          `JOB_RESTORE_STATUS_${res.status}: ${text || "EMPTY_RESPONSE_FROM_API"}`,
        );
        return;
      }

      await fetchJob();
    } finally {
      setRestoring(false);
    }
  };

  const isArchived = !!job?.is_archived;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!jobId || isArchived) return;

    try {
      setSaving(true);
      setError(null);

      if (!form.title.trim()) throw new Error("Job title is required");
      if (!form.description.trim()) throw new Error("Description is required");
      if (!form.location.trim()) throw new Error("Location is required");
      if (!form.profession.trim()) throw new Error("Profession is required");
      if (!form.engineering_discipline.trim()) {
        throw new Error("Engineering discipline is required");
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),

        profession_category: form.profession_category.trim() || null,
        profession: form.profession.trim() || null,
        engineering_discipline: form.engineering_discipline.trim() || null,
        industry: form.industry.trim() || null,

        location: form.location.trim() || null,
        postcode: form.postcode.trim() || null,
        work_radius_miles: toNumberOrNull(form.work_radius_miles),
        site_name: form.site_name.trim() || null,
        site_address: form.site_address.trim() || null,

        start_date: form.start_date || null,
        end_date: form.end_date || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        shift_pattern: form.shift_pattern.trim() || null,

        rate_type: form.rate_type.trim() || null,
        day_rate_min: toNumberOrNull(form.day_rate_min),
        day_rate_max: toNumberOrNull(form.day_rate_max),
        hourly_rate_min: toNumberOrNull(form.hourly_rate_min),
        hourly_rate_max: toNumberOrNull(form.hourly_rate_max),
        ir35_type: form.ir35_type.trim() || null,

        required_skills: form.required_skills.trim() || null,
        preferred_skills: form.preferred_skills.trim() || null,
        required_qualifications: form.required_qualifications.trim() || null,
        experience_level: form.experience_level.trim() || null,

        contract_type: form.contract_type.trim() || null,
        is_urgent: form.is_urgent,
        requires_travel: form.requires_travel,
        requires_vehicle: form.requires_vehicle,
        requires_own_tools: form.requires_own_tools,
      };

      const res = await fetch(`/api/company/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(
          `JOB_UPDATE_STATUS_${res.status}: ${text || "EMPTY_RESPONSE_FROM_API"}`,
        );
        return;
      }

      router.push(`/dashboard/company/jobs/${jobId}`);
    } catch (err: any) {
      setError(
        typeof err?.message === "string" ? err.message : "UNKNOWN_JOB_UPDATE_ERROR",
      );
    } finally {
      setSaving(false);
    }
  };

  const showDayRates = form.rate_type === "day" || !form.rate_type;
  const showHourlyRates = form.rate_type === "hour";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit job</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Update the details for this role.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          className="rounded-xl border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-900"
        >
          ← Back
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/70">
        <div className="border-b border-neutral-800/80 bg-gradient-to-r from-purple-900/30 via-neutral-900 to-neutral-950 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300/80">
            Job editor
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            ContractPros – structured company requisition
          </p>
        </div>

        <div className="px-6 py-6">
          {loading && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-10 text-center text-sm text-neutral-400">
              Loading job…
            </div>
          )}

          {!loading && error && (
            <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              <p className="font-medium">There was a problem</p>
              <p className="mt-1 break-all text-xs text-red-200/80">{error}</p>
            </div>
          )}

          {!loading && !error && !job && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-10 text-center text-sm text-neutral-400">
              Job not found.
            </div>
          )}

          {!loading && job && isArchived && (
            <div className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-sm text-neutral-200">
              This job is archived, so editing is disabled.
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={restoring}
                  className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:opacity-60"
                >
                  {restoring ? "Restoring…" : "Restore job"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800"
                >
                  Back to job
                </button>
              </div>
            </div>
          )}

          {!loading && job && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="space-y-4">
                <h2 className="text-sm font-medium text-neutral-200">Core details</h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Job title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    disabled={isArchived}
                    placeholder="e.g. Electrical Engineer Nights"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Profession category
                    </label>
                    <select
                      name="profession_category"
                      value={form.profession_category}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Health & Safety">Health & Safety</option>
                      <option value="Operations">Operations</option>
                      <option value="Projects">Projects</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Profession
                    </label>
                    <select
                      name="profession"
                      value={form.profession}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    >
                      <option value="Engineer">Engineer</option>
                      <option value="Technician">Technician</option>
                      <option value="Manager">Manager</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Consultant">Consultant</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Engineering discipline
                    </label>
                    <select
                      name="engineering_discipline"
                      value={form.engineering_discipline}
                      onChange={handleChange}
                      required
                      disabled={isArchived}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    >
                      <option value="">Select discipline</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Automation">Automation</option>
                      <option value="Controls">Controls</option>
                      <option value="Multi-skilled">Multi-skilled</option>
                      <option value="Reliability">Reliability</option>
                      <option value="Projects">Projects</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Industry
                    </label>
                    <input
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      disabled={isArchived}
                      placeholder="e.g. Food Manufacturing"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4 border-t border-neutral-800 pt-6">
                <h2 className="text-sm font-medium text-neutral-200">Location & site</h2>

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
                      disabled={isArchived}
                      placeholder="e.g. Swindon"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Postcode
                    </label>
                    <input
                      name="postcode"
                      value={form.postcode}
                      onChange={handleChange}
                      disabled={isArchived}
                      placeholder="e.g. SN1 1AA"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Work radius (miles)
                    </label>
                    <input
                      type="number"
                      name="work_radius_miles"
                      value={form.work_radius_miles}
                      onChange={handleChange}
                      disabled={isArchived}
                      placeholder="30"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Site name
                    </label>
                    <input
                      name="site_name"
                      value={form.site_name}
                      onChange={handleChange}
                      disabled={isArchived}
                      placeholder="e.g. Main production site"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Site address
                  </label>
                  <textarea
                    name="site_address"
                    value={form.site_address}
                    onChange={handleChange}
                    rows={3}
                    disabled={isArchived}
                    placeholder="Full site address"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                  />
                </div>
              </section>

              <section className="space-y-4 border-t border-neutral-800 pt-6">
                <h2 className="text-sm font-medium text-neutral-200">Dates & times</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Start date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      End date
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Start time
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={form.start_time}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      End time
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={form.end_time}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Shift pattern
                    </label>
                    <input
                      name="shift_pattern"
                      value={form.shift_pattern}
                      onChange={handleChange}
                      disabled={isArchived}
                      placeholder="e.g. Nights / 4 on 4 off"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4 border-t border-neutral-800 pt-6">
                <h2 className="text-sm font-medium text-neutral-200">Commercials</h2>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Rate type
                    </label>
                    <select
                      name="rate_type"
                      value={form.rate_type}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    >
                      <option value="day">Day</option>
                      <option value="hour">Hour</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      IR35
                    </label>
                    <select
                      name="ir35_type"
                      value={form.ir35_type}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    >
                      <option value="">Select IR35 status</option>
                      <option value="inside">Inside IR35</option>
                      <option value="outside">Outside IR35</option>
                      <option value="either">Either</option>
                    </select>
                  </div>
                </div>

                {showDayRates && (
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
                        disabled={isArchived}
                        placeholder="550"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
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
                        disabled={isArchived}
                        placeholder="650"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                      />
                    </div>
                  </div>
                )}

                {showHourlyRates && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                        Hourly rate (min)
                      </label>
                      <input
                        type="number"
                        name="hourly_rate_min"
                        value={form.hourly_rate_min}
                        onChange={handleChange}
                        disabled={isArchived}
                        placeholder="35"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                        Hourly rate (max)
                      </label>
                      <input
                        type="number"
                        name="hourly_rate_max"
                        value={form.hourly_rate_max}
                        onChange={handleChange}
                        disabled={isArchived}
                        placeholder="45"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                      />
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-4 border-t border-neutral-800 pt-6">
                <h2 className="text-sm font-medium text-neutral-200">Requirements</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Experience level
                    </label>
                    <select
                      name="experience_level"
                      value={form.experience_level}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    >
                      <option value="">Select level</option>
                      <option value="Junior">Junior</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      Contract type
                    </label>
                    <select
                      name="contract_type"
                      value={form.contract_type}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                    >
                      <option value="">Select type</option>
                      <option value="Contract">Contract</option>
                      <option value="Interim">Interim</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Shift cover">Shift cover</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Required skills
                  </label>
                  <textarea
                    name="required_skills"
                    value={form.required_skills}
                    onChange={handleChange}
                    rows={3}
                    disabled={isArchived}
                    placeholder="e.g. Fault finding, PLC diagnostics, PPM, root cause analysis"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Preferred skills
                  </label>
                  <textarea
                    name="preferred_skills"
                    value={form.preferred_skills}
                    onChange={handleChange}
                    rows={3}
                    disabled={isArchived}
                    placeholder="Nice-to-have skills"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Required qualifications
                  </label>
                  <textarea
                    name="required_qualifications"
                    value={form.required_qualifications}
                    onChange={handleChange}
                    rows={3}
                    disabled={isArchived}
                    placeholder="e.g. 18th Edition, NVQ Level 3, IOSH"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                  />
                </div>
              </section>

              <section className="space-y-4 border-t border-neutral-800 pt-6">
                <h2 className="text-sm font-medium text-neutral-200">Flags</h2>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-sm text-neutral-200">
                    <input
                      type="checkbox"
                      name="is_urgent"
                      checked={form.is_urgent}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="h-4 w-4 rounded border-neutral-600 bg-neutral-900"
                    />
                    Urgent requirement
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-sm text-neutral-200">
                    <input
                      type="checkbox"
                      name="requires_travel"
                      checked={form.requires_travel}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="h-4 w-4 rounded border-neutral-600 bg-neutral-900"
                    />
                    Requires travel
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-sm text-neutral-200">
                    <input
                      type="checkbox"
                      name="requires_vehicle"
                      checked={form.requires_vehicle}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="h-4 w-4 rounded border-neutral-600 bg-neutral-900"
                    />
                    Requires vehicle
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-sm text-neutral-200">
                    <input
                      type="checkbox"
                      name="requires_own_tools"
                      checked={form.requires_own_tools}
                      onChange={handleChange}
                      disabled={isArchived}
                      className="h-4 w-4 rounded border-neutral-600 bg-neutral-900"
                    />
                    Requires own tools
                  </label>
                </div>
              </section>

              <section className="space-y-1.5 border-t border-neutral-800 pt-6">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  disabled={isArchived}
                  placeholder="Full job overview, responsibilities, environment, and anything candidates should know."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60"
                />
              </section>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-4">
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving || isArchived}
                    className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-500"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-xl border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-neutral-500">
                  Job ID:{" "}
                  <span className="font-mono text-neutral-300">#{job.id}</span>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}