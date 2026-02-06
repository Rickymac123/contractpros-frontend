"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User, MapPin, Briefcase, PoundSterling, Sparkles, ImageIcon } from "lucide-react";

type Talent = {
  id: number;
  full_name: string;
  profession: string;
  location: string;
  day_rate: number;
  skills: string | null;
  bio?: string | null;
  profile_image_url?: string | null;
};

export default function TalentEditPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuthUser();

  const [talent, setTalent] = useState<Talent | null>(null);

  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [profession, setProfession] = useState("");
  const [dayRate, setDayRate] = useState<string>("");
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loadingTalent, setLoadingTalent] = useState(true);
  const [saving, setSaving] = useState(false);

  const idParam = params?.id;
  const idRaw = Array.isArray(idParam) ? idParam[0] : idParam;
  const talentIdNumber = idRaw ? Number(idRaw) : NaN;
  const invalidId = Number.isNaN(talentIdNumber) || talentIdNumber <= 0;

  // Enforce role: only agency
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyUser = user as any;
    const role: string =
      anyUser.is_superuser || anyUser.role === "admin"
        ? "admin"
        : anyUser.role || "company";

    if (role === "company") router.replace("/dashboard/company");
    if (role === "admin") router.replace("/dashboard/admin");
  }, [user, loading, router]);

  // Load existing talent
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyUser = user as any;
    const role: string =
      anyUser?.is_superuser || anyUser?.role === "admin"
        ? "admin"
        : anyUser?.role || "company";

    if (!user || role !== "agency") return;

    if (invalidId) {
      setError("Invalid talent id in URL.");
      setLoadingTalent(false);
      return;
    }

    const load = async () => {
      setLoadingTalent(true);
      setError(null);

      try {
        const res = await fetch(`/api/agency/talent?id=${talentIdNumber}`, {
          cache: "no-store",
        });
        const text = await res.text();

        if (!res.ok) {
          let detailDisplay = `STATUS ${res.status}: ${text || "(empty body)"}`;
          try {
            const parsed = text ? JSON.parse(text) : null;
            if (parsed && typeof parsed === "object" && "detail" in parsed) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const d = (parsed as any).detail;
              detailDisplay =
                typeof d === "string"
                  ? `STATUS ${res.status}: ${d}`
                  : `STATUS ${res.status}: ${JSON.stringify(d)}`;
            }
          } catch {
            // ignore
          }
          setError(detailDisplay);
          setLoadingTalent(false);
          return;
        }

        const data = text ? (JSON.parse(text) as Talent) : null;
        setTalent(data);

        if (data) {
          setFullName(data.full_name ?? "");
          setLocation(data.location ?? "");
          setProfession(data.profession ?? "");
          setDayRate(data.day_rate != null ? String(data.day_rate) : "");
          setSkills(data.skills ?? "");
          setBio(data.bio ?? "");
          setAvatarUrl(data.profile_image_url ?? "");
        }
      } catch (err: any) {
        setError(typeof err?.message === "string" ? err.message : "Failed to load talent");
      } finally {
        setLoadingTalent(false);
      }
    };

    load();
  }, [user, invalidId, talentIdNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalidId) return;

    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = {
      full_name: fullName,
      location,
      profession,
      day_rate: dayRate ? Number(dayRate) : null,
      skills: skills || null,
      bio: bio || null,
      profile_image_url: avatarUrl || null,
    };

    try {
      const res = await fetch(`/api/agency/talent?id=${talentIdNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        let detailDisplay = `STATUS ${res.status}: ${text || "(empty body)"}`;
        try {
          const parsed = text ? JSON.parse(text) : null;
          if (parsed && typeof parsed === "object" && "detail" in parsed) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const d = (parsed as any).detail;
            detailDisplay = typeof d === "string" ? d : JSON.stringify(d);
          }
        } catch {
          // ignore
        }

        setError(detailDisplay);
        setSaving(false);
        return;
      }

      router.replace(`/dashboard/agency/talent/${talentIdNumber}`);
    } catch (err: any) {
      setError(typeof err?.message === "string" ? err.message : "Failed to save changes");
      setSaving(false);
    }
  };

  // Flattened: let global layout own bg/min-height/glow.
  if (invalidId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-neutral-300">
        Invalid talent ID
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-neutral-300">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          className="border-neutral-700 bg-neutral-900 text-xs text-neutral-200 hover:bg-neutral-800"
          onClick={() => router.push(`/dashboard/agency/talent/${talentIdNumber}`)}
        >
          ← Back to profile
        </Button>

        <div className="flex items-center gap-2 text-xs text-purple-300">
          <Sparkles className="h-4 w-4" />
          <span>Edit talent profile</span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-xs text-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {!error && loadingTalent && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-10 text-center text-sm text-neutral-400">
          Loading talent…
        </div>
      )}

      {!error && !loadingTalent && (
        <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/70">
          <div className="border-b border-neutral-800/80 bg-gradient-to-r from-purple-900/30 via-neutral-900 to-neutral-950 px-6 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300/80">
              Talent editor
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Update the profile. Bad data in here becomes everyone’s problem.
            </p>
          </div>

          <Card className="border-0 bg-transparent p-6 md:p-8 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* SECTION 1 – Basic info */}
              <div className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Basic information
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Full name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Full name
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-1.5 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/40 transition">
                      <User className="h-4 w-4 text-neutral-400" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full name"
                        className="flex-1 border-none bg-transparent text-sm text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Location
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-1.5 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/40 transition">
                      <MapPin className="h-4 w-4 text-neutral-400" />
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City / region"
                        className="flex-1 border-none bg-transparent text-sm text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Profession */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Profession
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-1.5 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/40 transition">
                      <Briefcase className="h-4 w-4 text-neutral-400" />
                      <Input
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="e.g. Maintenance Engineer"
                        className="flex-1 border-none bg-transparent text-sm text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>

                  {/* Day rate */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Day rate (£)
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-1.5 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/40 transition">
                      <PoundSterling className="h-4 w-4 text-neutral-400" />
                      <Input
                        type="number"
                        value={dayRate}
                        onChange={(e) => setDayRate(e.target.value)}
                        placeholder="550"
                        className="flex-1 border-none bg-transparent text-sm text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-neutral-800" />

              {/* SECTION 2 – Skills & bio */}
              <div className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Skills & bio
                </h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Skills
                  </label>
                  <Textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Comma-separated skills or a short list…"
                    className="min-h-[70px] rounded-xl border border-neutral-700 bg-neutral-950/60 text-sm text-white placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-purple-500/40 focus-visible:ring-offset-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Bio
                  </label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short background, experience, and what they’re looking for…"
                    className="min-h-[110px] rounded-xl border border-neutral-700 bg-neutral-950/60 text-sm text-white placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-purple-500/40 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="h-px bg-neutral-800" />

              {/* SECTION 3 – Avatar */}
              <div className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Avatar
                </h2>

                <div className="grid gap-4 md:grid-cols-[2fr,1fr] items-start">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Avatar URL
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-1.5 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/40 transition">
                      <ImageIcon className="h-4 w-4 text-neutral-400" />
                      <Input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://…"
                        className="flex-1 border-none bg-transparent text-sm text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-500">
                      Use a direct image URL. Square images look best.
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-950/40 px-4 py-4 text-center">
                    <div className="h-14 w-14 overflow-hidden rounded-full border border-neutral-700 bg-neutral-900">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="Avatar preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-500">
                          No image
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      Live preview
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-neutral-700 bg-neutral-900 text-xs text-neutral-200 hover:bg-neutral-800"
                  onClick={() => router.push(`/dashboard/agency/talent/${talentIdNumber}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-500 text-xs font-semibold"
                >
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}