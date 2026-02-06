"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

const PROFESSION_OPTIONS = [
  { value: "engineering", label: "Engineering" },
  { value: "operations", label: "Operations" },
  { value: "quality", label: "Quality" },
  { value: "technical", label: "Technical" },
  { value: "maintenance", label: "Maintenance" },
  { value: "project_management", label: "Project Management" },
  { value: "hse", label: "HSE" },
  { value: "supply_chain", label: "Supply Chain" },
  { value: "other", label: "Other" },
];

const INDUSTRY_OPTIONS = [
  { value: "food", label: "Food" },
  { value: "fmcg", label: "FMCG" },
  { value: "pharma", label: "Pharma" },
  { value: "medical_devices", label: "Medical Devices" },
  { value: "automotive", label: "Automotive" },
  { value: "aerospace", label: "Aerospace" },
  { value: "packaging", label: "Packaging" },
  { value: "chemicals", label: "Chemicals" },
  { value: "energy_utilities", label: "Energy & Utilities" },
  { value: "other", label: "Other" },
];

export default function ProfessionalProfileSetupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [profession, setProfession] = useState("");
  const [professionOther, setProfessionOther] = useState("");

  const [engineeringDiscipline, setEngineeringDiscipline] = useState("");

  const [industry, setIndustry] = useState("");
  const [industryOther, setIndustryOther] = useState("");

  const [postcode, setPostcode] = useState("");
  const [location, setLocation] = useState("");

  const [workRadiusMiles, setWorkRadiusMiles] = useState("");

  const [ir35Preference, setIr35Preference] = useState("either");

  const [rateType, setRateType] = useState("day");
  const [dayRate, setDayRate] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const [bio, setBio] = useState("");

  // uploads
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);

    try {
      // Required create fields (match backend expectations)
      if (!firstName.trim() || !lastName.trim()) return setError("FIRST_AND_LAST_NAME_REQUIRED");
      if (!postcode.trim()) return setError("POSTCODE_REQUIRED");

      const professionFinal =
        profession === "other" ? professionOther.trim() : profession.trim();
      if (!professionFinal) return setError("PROFESSION_REQUIRED");

      const industryFinal = industry === "other" ? industryOther.trim() : industry.trim();

      const radius = workRadiusMiles.trim() ? Number(workRadiusMiles) : null;
      if (radius != null && Number.isNaN(radius)) return setError("WORK_RADIUS_MILES_MUST_BE_A_NUMBER");

      const day = dayRate.trim() ? Number(dayRate) : null;
      if (day != null && Number.isNaN(day)) return setError("DAY_RATE_MUST_BE_A_NUMBER");

      const hour = hourlyRate.trim() ? Number(hourlyRate) : null;
      if (hour != null && Number.isNaN(hour)) return setError("HOURLY_RATE_MUST_BE_A_NUMBER");

      // 1) uploads first -> get URLs to store on talent profile
      let avatarUrl: string | null = null;
      let cvUrl: string | null = null;

      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        const res = await fetch("/api/uploads/avatar", { method: "POST", body: fd });
        const text = await res.text();
        if (!res.ok) return setError(extractDetail(text, res.status));
        const data = text ? JSON.parse(text) : null;
        avatarUrl = (data?.url as string) || null;
      }

      if (cvFile) {
        const fd = new FormData();
        fd.append("file", cvFile);
        const res = await fetch("/api/uploads/cv", { method: "POST", body: fd });
        const text = await res.text();
        if (!res.ok) return setError(extractDetail(text, res.status));
        const data = text ? JSON.parse(text) : null;
        cvUrl = (data?.url as string) || null;
      }

      // 2) create talent profile
      const payload: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),

        profession: professionFinal,
        engineering_discipline: engineeringDiscipline.trim() || null,
        industry: industryFinal || null,

        postcode: postcode.trim(),
        location: location.trim() || null,

        work_radius_miles: radius,

        ir35_preference: ir35Preference || null,

        rate_type: rateType || null,
        day_rate: rateType === "day" ? day : null,
        hourly_rate: rateType === "hour" ? hour : null,

        avatar_url: avatarUrl,
        cv_url: cvUrl,

        bio: bio.trim() || null,
      };

      const res = await fetch("/api/professional/talent", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) return setError(extractDetail(text, res.status));

      router.replace("/dashboard/professional/profile");
    } finally {
      setLoading(false);
    }
  };

  const busy = loading;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_55%)]" />

      <div className="relative mx-auto max-w-3xl px-4 py-12 space-y-6">
        <div className="rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_40px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="border-b border-neutral-800/80 px-6 py-4">
            <h1 className="text-xl font-semibold tracking-tight">Set up your professional profile</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Add your details and upload a profile picture + CV.
            </p>
          </div>

          <div className="px-6 py-6 space-y-5">
            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-2 text-sm text-red-200 whitespace-pre-wrap">
                {error}
              </div>
            )}

            <Section title="Uploads">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Profile picture (optional)">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={busy}
                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                    className="fileInput"
                  />
                </Field>
                <Field label="CV (optional)">
                  <input
                    type="file"
                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={busy}
                    onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                    className="fileInput"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Profile">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="First name *">
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input" />
                </Field>

                <Field label="Last name *">
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input" />
                </Field>

                <Field label="Profession *">
                  <select
                    value={profession}
                    onChange={(e) => {
                      setProfession(e.target.value);
                      if (e.target.value !== "other") setProfessionOther("");
                    }}
                    className="select"
                  >
                    <option value="">— Select —</option>
                    {PROFESSION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  {profession === "other" && (
                    <input
                      value={professionOther}
                      onChange={(e) => setProfessionOther(e.target.value)}
                      className="input mt-2"
                      placeholder="Enter profession"
                    />
                  )}
                </Field>

                <Field label="Engineering discipline">
                  <select
                    value={engineeringDiscipline}
                    onChange={(e) => setEngineeringDiscipline(e.target.value)}
                    className="select"
                  >
                    <option value="">—</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="electrical">Electrical</option>
                    <option value="multiskilled">Multiskilled</option>
                    <option value="other">Other</option>
                  </select>
                </Field>

                <Field label="Industry">
                  <select
                    value={industry}
                    onChange={(e) => {
                      setIndustry(e.target.value);
                      if (e.target.value !== "other") setIndustryOther("");
                    }}
                    className="select"
                  >
                    <option value="">— Select —</option>
                    {INDUSTRY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  {industry === "other" && (
                    <input
                      value={industryOther}
                      onChange={(e) => setIndustryOther(e.target.value)}
                      className="input mt-2"
                      placeholder="Enter industry"
                    />
                  )}
                </Field>

                <Field label="Postcode *">
                  <input value={postcode} onChange={(e) => setPostcode(e.target.value)} className="input" />
                </Field>

                <Field label="Location (optional)">
                  <input value={location} onChange={(e) => setLocation(e.target.value)} className="input" />
                </Field>

                <Field label="Work radius (miles)">
                  <input
                    value={workRadiusMiles}
                    onChange={(e) => setWorkRadiusMiles(e.target.value)}
                    inputMode="numeric"
                    className="input"
                    placeholder="e.g. 50"
                  />
                </Field>

                <Field label="IR35 preference">
                  <select value={ir35Preference} onChange={(e) => setIr35Preference(e.target.value)} className="select">
                    <option value="either">Either</option>
                    <option value="outside">Outside</option>
                    <option value="inside">Inside</option>
                  </select>
                </Field>

                <Field label="Rate type">
                  <select value={rateType} onChange={(e) => setRateType(e.target.value)} className="select">
                    <option value="day">Day rate</option>
                    <option value="hour">Hourly rate</option>
                  </select>
                </Field>

                <Field label="Day rate (£)">
                  <input
                    value={dayRate}
                    onChange={(e) => setDayRate(e.target.value)}
                    inputMode="decimal"
                    disabled={rateType === "hour"}
                    className="input disabled:opacity-60"
                    placeholder="e.g. 450"
                  />
                </Field>

                <Field label="Hourly rate (£)">
                  <input
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    inputMode="decimal"
                    disabled={rateType === "day"}
                    className="input disabled:opacity-60"
                    placeholder="e.g. 55"
                  />
                </Field>
              </div>

              <Field label="Bio">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Short summary of your experience…"
                />
              </Field>
            </Section>

            <div className="flex items-center justify-between gap-3 border-t border-neutral-800/80 pt-4">
              <div className="text-[11px] text-neutral-500">Fields marked * are required.</div>
              <button
                onClick={submit}
                disabled={busy}
                className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-5 py-2 text-sm font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:opacity-60"
              >
                {busy ? "Saving…" : "Create profile"}
              </button>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .input {
            margin-top: 0.25rem;
            width: 100%;
            border-radius: 0.75rem;
            border: 1px solid rgba(38, 38, 38, 0.8);
            background: rgba(10, 10, 10, 0.6);
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            color: white;
            outline: none;
          }
          .input:focus {
            border-color: rgba(168, 85, 247, 1);
          }
          .select {
            margin-top: 0.25rem;
            width: 100%;
            border-radius: 0.75rem;
            border: 1px solid rgba(38, 38, 38, 0.8);
            background: rgba(10, 10, 10, 0.6);
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            color: rgb(229, 229, 229);
            outline: none;
          }
          .select:focus {
            border-color: rgba(168, 85, 247, 1);
          }
          .fileInput {
            margin-top: 0.25rem;
            display: block;
            width: 100%;
            max-width: 28rem;
            font-size: 0.75rem;
            color: rgb(229, 229, 229);
          }
          .fileInput::file-selector-button {
            margin-right: 0.75rem;
            border-radius: 0.75rem;
            border: 1px solid rgba(38, 38, 38, 0.8);
            background: rgba(10, 10, 10, 0.6);
            padding: 0.5rem 0.75rem;
            font-size: 0.75rem;
            color: rgb(229, 229, 229);
          }
          .fileInput::file-selector-button:hover {
            background: rgba(23, 23, 23, 0.8);
          }
        `}</style>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950/40 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">{title}</div>
      <div className="mt-3 space-y-4">{children}</div>
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