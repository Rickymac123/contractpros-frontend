"use client";

import { useEffect, useMemo, useState } from "react";

type TalentProfile = {
  id?: number;

  first_name?: string | null;
  last_name?: string | null;

  profession?: string | null;
  location?: string | null;
  postcode?: string | null;

  work_radius_miles?: number | null;

  ir35_preference?: "inside" | "outside" | "either" | string | null;
  engineering_discipline?:
    | "mechanical"
    | "electrical"
    | "multiskilled"
    | "other"
    | string
    | null;
  industry?: string | null;

  rate_type?: "day" | "hour" | string | null;
  day_rate?: number | null;
  hourly_rate?: number | null;

  avatar_url?: string | null;
  cv_url?: string | null;

  bio?: string | null;
  skills?: string | null;
};

type Qualification = {
  id: number;
  talent_id: number;
  name: string;
  issuer?: string | null;
  credential_ref?: string | null;
  is_verified: boolean;
  verified_by_user_id?: number | null;
  verified_at?: string | null;
  created_at?: string | null;
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

function labelFor(
  options: { value: string; label: string }[],
  value?: string | null,
) {
  const v = (value ?? "").trim();
  if (!v) return "";
  const hit = options.find((o) => o.value === v);
  return hit?.label ?? "";
}

function isFilled(v: unknown) {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return !Number.isNaN(v);
  return true;
}

function computeProfessionalCompleteness(p: {
  first_name?: string | null;
  last_name?: string | null;
  profession?: string | null;
  postcode?: string | null;
  work_radius_miles?: number | null;
  ir35_preference?: string | null;
  rate_type?: string | null;
  day_rate?: number | null;
  hourly_rate?: number | null;
  engineering_discipline?: string | null;
  industry?: string | null;
  avatar_url?: string | null;
  cv_url?: string | null;
  bio?: string | null;
  skills?: string | null;
}) {
  const items = [
    { key: "first_name", label: "First name", w: 10, ok: isFilled(p.first_name) },
    { key: "last_name", label: "Last name", w: 10, ok: isFilled(p.last_name) },
    { key: "profession", label: "Profession", w: 15, ok: isFilled(p.profession) },
    { key: "postcode", label: "Postcode", w: 10, ok: isFilled(p.postcode) },
    { key: "work_radius_miles", label: "Work radius", w: 5, ok: isFilled(p.work_radius_miles) },
    { key: "ir35_preference", label: "IR35 preference", w: 5, ok: isFilled(p.ir35_preference) },
    { key: "rate_type", label: "Rate type", w: 5, ok: isFilled(p.rate_type) },
    {
      key: "rate_value",
      label: "Rate (day/hour)",
      w: 15,
      ok:
        (p.rate_type === "day" && isFilled(p.day_rate)) ||
        (p.rate_type === "hour" && isFilled(p.hourly_rate)) ||
        (p.rate_type == null && (isFilled(p.day_rate) || isFilled(p.hourly_rate))),
    },
    { key: "avatar_url", label: "Profile photo", w: 10, ok: isFilled(p.avatar_url) },
    { key: "cv_url", label: "CV uploaded", w: 10, ok: isFilled(p.cv_url) },
    { key: "bio", label: "Bio", w: 10, ok: isFilled(p.bio) },
    { key: "skills", label: "Skills", w: 5, ok: isFilled(p.skills) },
    { key: "engineering_discipline", label: "Engineering discipline", w: 5, ok: isFilled(p.engineering_discipline) },
    { key: "industry", label: "Industry", w: 5, ok: isFilled(p.industry) },
  ];

  const total = items.reduce((a, i) => a + i.w, 0);
  const done = items.filter((i) => i.ok).reduce((a, i) => a + i.w, 0);
  const percent = Math.round((done / total) * 100);
  const missing = items.filter((i) => !i.ok).map((i) => i.label);

  return { percent, missing };
}

function VerifiedTick() {
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-600/20 text-purple-300 ring-1 ring-purple-500/30"
      title="Verified qualification"
      aria-label="Verified qualification"
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
        <path d="M10 1.8l2.07 2.08 2.93-.42 1.35 2.64 2.64 1.35-.42 2.93L20 10l-1.43 2.62.42 2.93-2.64 1.35-1.35 2.64-2.93-.42L10 20l-2.62-1.43-2.93.42-1.35-2.64-2.64-1.35.42-2.93L0 10l1.43-2.62-.42-2.93 2.64-1.35 1.35-2.64 2.93.42zM8.6 13.9l5.1-5.1-1.06-1.06-4.04 4.04-1.8-1.8-1.06 1.06z" />
      </svg>
    </span>
  );
}

export default function ProfessionalProfilePage() {
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [creatingQualification, setCreatingQualification] = useState(false);
  const [deletingQualificationId, setDeletingQualificationId] = useState<number | null>(null);

  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [profession, setProfession] = useState("");
  const [professionOther, setProfessionOther] = useState("");

  const [engineeringDiscipline, setEngineeringDiscipline] = useState<string>("");
  const [industry, setIndustry] = useState("");
  const [industryOther, setIndustryOther] = useState("");

  const [postcode, setPostcode] = useState("");
  const [location, setLocation] = useState("");

  const [workRadiusMiles, setWorkRadiusMiles] = useState<string>("");

  const [ir35Preference, setIr35Preference] = useState<string>("either");

  const [rateType, setRateType] = useState<string>("day");
  const [dayRate, setDayRate] = useState<string>("");
  const [hourlyRate, setHourlyRate] = useState<string>("");

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [cvUrl, setCvUrl] = useState<string>("");

  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");

  const [qualificationName, setQualificationName] = useState("");
  const [qualificationIssuer, setQualificationIssuer] = useState("");
  const [qualificationRef, setQualificationRef] = useState("");

  const hasProfile = useMemo(() => !!profile?.id, [profile]);

  const normaliseIncomingToDropdown = (
    incoming: string | null | undefined,
    options: { value: string; label: string }[],
  ) => {
    const v = (incoming ?? "").trim();
    if (!v) return { value: "", other: "" };

    if (options.some((o) => o.value === v)) return { value: v, other: "" };

    const byLabel = options.find((o) => o.label.toLowerCase() === v.toLowerCase());
    if (byLabel) return { value: byLabel.value, other: "" };

    return { value: "other", other: v };
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setInfo(null);

      const [profileRes, qualificationsRes] = await Promise.all([
        fetch("/api/professional/talent/me", { cache: "no-store" }),
        fetch("/api/professional/qualifications", { cache: "no-store" }),
      ]);

      const profileText = await profileRes.text();
      const qualificationsText = await qualificationsRes.text();

      if (!profileRes.ok) {
        if (profileRes.status === 404) {
          setProfile(null);
          setQualifications([]);

          setFirstName("");
          setLastName("");
          setProfession("");
          setProfessionOther("");
          setEngineeringDiscipline("");
          setIndustry("");
          setIndustryOther("");
          setPostcode("");
          setLocation("");
          setWorkRadiusMiles("");
          setIr35Preference("either");
          setRateType("day");
          setDayRate("");
          setHourlyRate("");
          setAvatarUrl("");
          setCvUrl("");
          setBio("");
          setSkills("");
          return;
        }

        setError(extractDetail(profileText, profileRes.status));
        return;
      }

      if (!qualificationsRes.ok) {
        setError(extractDetail(qualificationsText, qualificationsRes.status));
        return;
      }

      const data = profileText ? (JSON.parse(profileText) as TalentProfile) : null;
      const qualificationsData = qualificationsText ? (JSON.parse(qualificationsText) as Qualification[]) : [];

      setProfile(data);
      setQualifications(Array.isArray(qualificationsData) ? qualificationsData : []);

      setFirstName((data?.first_name ?? "") as string);
      setLastName((data?.last_name ?? "") as string);

      const p = normaliseIncomingToDropdown(data?.profession ?? "", PROFESSION_OPTIONS);
      setProfession(p.value);
      setProfessionOther(p.other);

      setEngineeringDiscipline((data?.engineering_discipline ?? "") as string);

      const ind = normaliseIncomingToDropdown(data?.industry ?? "", INDUSTRY_OPTIONS);
      setIndustry(ind.value);
      setIndustryOther(ind.other);

      setPostcode((data?.postcode ?? "") as string);
      setLocation((data?.location ?? "") as string);

      setWorkRadiusMiles(data?.work_radius_miles != null ? String(data.work_radius_miles) : "");
      setIr35Preference((data?.ir35_preference ?? "either") as string);

      setRateType((data?.rate_type ?? "day") as string);
      setDayRate(data?.day_rate != null ? String(data.day_rate) : "");
      setHourlyRate(data?.hourly_rate != null ? String(data.hourly_rate) : "");

      setAvatarUrl((data?.avatar_url ?? "") as string);
      setCvUrl((data?.cv_url ?? "") as string);

      setBio((data?.bio ?? "") as string);
      setSkills((data?.skills ?? "") as string);
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_LOAD_PROFILE");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const uploadAvatar = async (file: File) => {
    setUploadingAvatar(true);
    setError(null);
    setInfo(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/uploads/avatar", { method: "POST", body: fd });
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

      setAvatarUrl(url);
      setInfo("Avatar uploaded");
      await load();
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_UPLOAD_AVATAR");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadCv = async (file: File) => {
    setUploadingCv(true);
    setError(null);
    setInfo(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/uploads/cv", { method: "POST", body: fd });
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

      setCvUrl(url);
      setInfo("CV uploaded");
      await load();
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "FAILED_TO_UPLOAD_CV");
    } finally {
      setUploadingCv(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setInfo(null);

    try {
      if (!firstName.trim() || !lastName.trim()) {
        setError("FIRST_AND_LAST_NAME_REQUIRED");
        return;
      }
      if (!postcode.trim()) {
        setError("POSTCODE_REQUIRED");
        return;
      }

      const professionFinal =
        profession === "other" ? professionOther.trim() : profession.trim();
      if (!professionFinal) {
        setError("PROFESSION_REQUIRED");
        return;
      }

      const industryFinal =
        industry === "other" ? industryOther.trim() : industry.trim();

      const day = dayRate.trim() ? Number(dayRate) : null;
      const hour = hourlyRate.trim() ? Number(hourlyRate) : null;
      const radius = workRadiusMiles.trim() ? Number(workRadiusMiles) : null;

      if (day != null && Number.isNaN(day)) {
        setError("DAY_RATE_MUST_BE_A_NUMBER");
        return;
      }
      if (hour != null && Number.isNaN(hour)) {
        setError("HOURLY_RATE_MUST_BE_A_NUMBER");
        return;
      }
      if (radius != null && Number.isNaN(radius)) {
        setError("WORK_RADIUS_MILES_MUST_BE_A_NUMBER");
        return;
      }

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
        day_rate: day,
        hourly_rate: hour,
        avatar_url: avatarUrl.trim() || null,
        cv_url: cvUrl.trim() || null,
        bio: bio.trim() || null,
        skills: skills.trim() || null,
      };

      if (!hasProfile) {
        const res = await fetch("/api/professional/talent", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        if (!res.ok) {
          setError(extractDetail(text, res.status));
          return;
        }
        setInfo("Profile created");
        await load();
        return;
      }

      const res = await fetch("/api/professional/talent/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) {
        setError(extractDetail(text, res.status));
        return;
      }

      setInfo("Profile saved");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const addQualification = async () => {
    setCreatingQualification(true);
    setError(null);
    setInfo(null);

    try {
      if (!qualificationName.trim()) {
        setError("QUALIFICATION_NAME_REQUIRED");
        return;
      }

      const res = await fetch("/api/professional/qualifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: qualificationName.trim(),
          issuer: qualificationIssuer.trim() || null,
          credential_ref: qualificationRef.trim() || null,
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        setError(extractDetail(text, res.status));
        return;
      }

      setQualificationName("");
      setQualificationIssuer("");
      setQualificationRef("");
      setInfo("Qualification added");
      await load();
    } finally {
      setCreatingQualification(false);
    }
  };

  const deleteQualification = async (qualificationId: number) => {
    setDeletingQualificationId(qualificationId);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch(`/api/professional/qualifications/${qualificationId}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        setError(extractDetail(text, res.status));
        return;
      }

      setInfo("Qualification removed");
      await load();
    } finally {
      setDeletingQualificationId(null);
    }
  };

  const busy =
    saving ||
    uploadingAvatar ||
    uploadingCv ||
    creatingQualification ||
    deletingQualificationId != null;

  const completeness = useMemo(() => {
    const day = dayRate.trim() ? Number(dayRate) : null;
    const hour = hourlyRate.trim() ? Number(hourlyRate) : null;
    const radius = workRadiusMiles.trim() ? Number(workRadiusMiles) : null;

    return computeProfessionalCompleteness({
      first_name: firstName,
      last_name: lastName,
      profession: profession === "other" ? professionOther : profession,
      postcode,
      work_radius_miles: Number.isNaN(radius as any) ? null : radius,
      ir35_preference: ir35Preference,
      rate_type: rateType,
      day_rate: Number.isNaN(day as any) ? null : day,
      hourly_rate: Number.isNaN(hour as any) ? null : hour,
      engineering_discipline: engineeringDiscipline,
      industry: industry === "other" ? industryOther : industry,
      avatar_url: avatarUrl,
      cv_url: cvUrl,
      bio,
      skills,
    });
  }, [
    firstName,
    lastName,
    profession,
    professionOther,
    postcode,
    workRadiusMiles,
    ir35Preference,
    rateType,
    dayRate,
    hourlyRate,
    engineeringDiscipline,
    industry,
    industryOther,
    avatarUrl,
    cvUrl,
    bio,
    skills,
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">My profile</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {hasProfile
              ? "Update your professional profile."
              : "Create your professional profile."}
          </p>
        </div>
      </header>

      {!loading && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-neutral-200">Profile completeness</div>
              <div className="mt-1 text-xs text-neutral-500">
                {completeness.percent}% complete
                {completeness.missing.length
                  ? ` • Missing: ${completeness.missing.slice(0, 3).join(", ")}${
                      completeness.missing.length > 3 ? "…" : ""
                    }`
                  : " • All set"}
              </div>
            </div>

            <div className="text-xs font-semibold text-purple-200">
              {completeness.percent}%
            </div>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-900">
            <div
              className="h-full rounded-full bg-purple-500/70 transition-[width] duration-300"
              style={{ width: `${completeness.percent}%` }}
            />
          </div>

          {completeness.missing.length > 0 && (
            <div className="mt-3 text-xs text-neutral-400">
              <div className="font-medium text-neutral-300">To improve matches, add:</div>
              <ul className="mt-1 list-disc pl-5 space-y-0.5">
                {completeness.missing.slice(0, 6).map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
            <h2 className="text-sm font-medium text-neutral-200">Profile details</h2>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="flex flex-wrap items-start gap-4">
              <div className="shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-16 w-16 rounded-2xl border border-neutral-800 object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl border border-purple-500/40 bg-purple-950/30 flex items-center justify-center">
                    <span className="text-xs font-semibold text-purple-200">No photo</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="text-xs font-medium text-neutral-300">Profile picture</div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadAvatar(f);
                      e.currentTarget.value = "";
                    }}
                    className="block w-full max-w-sm text-xs text-neutral-200
                      file:mr-3 file:rounded-xl file:border file:border-neutral-800
                      file:bg-neutral-950/60 file:px-3 file:py-2 file:text-xs file:text-neutral-200
                      hover:file:bg-neutral-900"
                  />
                  {uploadingAvatar && (
                    <span className="text-xs text-neutral-400">Uploading…</span>
                  )}
                </div>

                {avatarUrl && (
                  <div className="text-xs text-neutral-500 break-all">{avatarUrl}</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-neutral-300">CV</div>
                  <div className="mt-1 text-xs text-neutral-500">Upload PDF or DOCX.</div>
                  {cvUrl ? (
                    <div className="mt-2 text-xs text-neutral-400 break-all">
                      Stored:{" "}
                      <a
                        href={cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-300 hover:underline"
                      >
                        {cvUrl}
                      </a>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-neutral-500">No CV uploaded.</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadCv(f);
                      e.currentTarget.value = "";
                    }}
                    className="block w-full max-w-sm text-xs text-neutral-200
                      file:mr-3 file:rounded-xl file:border file:border-neutral-800
                      file:bg-neutral-950/60 file:px-3 file:py-2 file:text-xs file:text-neutral-200
                      hover:file:bg-neutral-900"
                  />
                  {uploadingCv && (
                    <span className="text-xs text-neutral-400">Uploading…</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="First name *">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="e.g. Ricky"
                />
              </Field>

              <Field label="Last name *">
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="e.g. McDonnell"
                />
              </Field>

              <Field label="Profession *">
                <select
                  value={profession}
                  onChange={(e) => {
                    setProfession(e.target.value);
                    if (e.target.value !== "other") setProfessionOther("");
                  }}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
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
                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                    placeholder="Enter profession"
                  />
                )}

                {!professionOther &&
                  profession &&
                  profession !== "other" &&
                  labelFor(PROFESSION_OPTIONS, profession) === "" && (
                    <div className="mt-1 text-[11px] text-neutral-500">
                      Saved value: {profession}
                    </div>
                  )}
              </Field>

              <Field label="Engineering discipline">
                <select
                  value={engineeringDiscipline}
                  onChange={(e) => setEngineeringDiscipline(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
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
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
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
                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                    placeholder="Enter industry"
                  />
                )}
              </Field>

              <Field label="Postcode *">
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="e.g. SW1A 1AA"
                />
              </Field>

              <Field label="Location (optional)">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="e.g. South Wales"
                />
              </Field>

              <Field label="Work radius (miles)">
                <input
                  value={workRadiusMiles}
                  onChange={(e) => setWorkRadiusMiles(e.target.value)}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="e.g. 50"
                />
              </Field>

              <Field label="IR35 preference">
                <select
                  value={ir35Preference}
                  onChange={(e) => setIr35Preference(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
                >
                  <option value="either">Either</option>
                  <option value="outside">Outside</option>
                  <option value="inside">Inside</option>
                </select>
              </Field>

              <Field label="Rate type">
                <select
                  value={rateType}
                  onChange={(e) => setRateType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
                >
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
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-60"
                  placeholder="e.g. 450"
                />
              </Field>

              <Field label="Hourly rate (£)">
                <input
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  inputMode="decimal"
                  disabled={rateType === "day"}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-60"
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

            <Field label="Skills">
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                rows={5}
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                placeholder={`One skill per line\n\nPLC programming\nFault finding\nPreventive maintenance`}
              />
              <div className="mt-1 text-[11px] text-neutral-500">
                Enter one skill per line. These will appear as bullet points on your public profile preview.
              </div>
            </Field>

            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-neutral-300">Qualifications</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Add qualifications here. Verification is handled by admin.
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Field label="Qualification name *">
                  <input
                    value={qualificationName}
                    onChange={(e) => setQualificationName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                    placeholder="e.g. 18th Edition"
                  />
                </Field>

                <Field label="Issuer">
                  <input
                    value={qualificationIssuer}
                    onChange={(e) => setQualificationIssuer(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                    placeholder="e.g. City & Guilds"
                  />
                </Field>

                <Field label="Credential ref">
                  <input
                    value={qualificationRef}
                    onChange={(e) => setQualificationRef(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                    placeholder="e.g. 2382"
                  />
                </Field>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={addQualification}
                  disabled={busy}
                  className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-4 py-2 text-xs font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:opacity-60"
                >
                  {creatingQualification ? "Adding…" : "Add qualification"}
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {qualifications.length === 0 ? (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-4 text-sm text-neutral-500">
                    No qualifications added yet.
                  </div>
                ) : (
                  qualifications.map((qualification) => (
                    <div
                      key={qualification.id}
                      className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-4 md:flex-row md:items-start md:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-neutral-200">
                            {qualification.name}
                          </div>
                          {qualification.is_verified ? (
                            <VerifiedTick />
                          ) : (
                            <span className="inline-flex rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-400">
                              Unverified
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {[qualification.issuer, qualification.credential_ref].filter(Boolean).join(" • ") || "No additional details"}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={() => deleteQualification(qualification.id)}
                          disabled={busy}
                          className="rounded-xl border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-200 transition hover:bg-red-900/30 disabled:opacity-60"
                        >
                          {deletingQualificationId === qualification.id ? "Removing…" : "Remove"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

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

            <div className="text-[11px] text-neutral-500">
              Fields marked * are required.
            </div>
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