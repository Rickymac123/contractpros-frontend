"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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

export default function TalentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuthUser();

  const [talent, setTalent] = useState<Talent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingTalent, setLoadingTalent] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Extract id from URL
  const idParam = params?.id;
  const idRaw = Array.isArray(idParam) ? idParam[0] : idParam;
  const talentIdNumber = idRaw ? Number(idRaw) : NaN;
  const invalidId = Number.isNaN(talentIdNumber) || talentIdNumber <= 0;

  // Enforce role: only agency can stay here
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

  // Load talent details
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

        const data = text ? JSON.parse(text) : null;
        setTalent(data as Talent);
      } catch (err: any) {
        setError(
          typeof err?.message === "string" ? err.message : "Failed to load talent",
        );
      } finally {
        setLoadingTalent(false);
      }
    };

    load();
  }, [user, invalidId, talentIdNumber]);

  const handleDelete = async () => {
    if (invalidId || !talent) return;

    const ok = window.confirm(
      `Delete talent profile for "${talent.full_name}"? This cannot be undone.`,
    );
    if (!ok) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/agency/talent?id=${talentIdNumber}`, {
        method: "DELETE",
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
        setDeleting(false);
        return;
      }

      router.replace("/dashboard/agency/talent");
    } catch (err: any) {
      setError(
        typeof err?.message === "string" ? err.message : "Failed to delete talent",
      );
      setDeleting(false);
    }
  };

  // Flattened: no page-level bg/min-h-screen; layout provides it
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
        Loading talent…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          className="border-neutral-700 bg-neutral-900 text-xs text-neutral-200 hover:bg-neutral-800"
          onClick={() => router.push("/dashboard/agency/talent")}
        >
          ← Back to talent
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-neutral-700 bg-neutral-900 text-xs text-neutral-200 hover:bg-neutral-800"
            onClick={() =>
              router.push(`/dashboard/agency/talent/${talentIdNumber}/edit`)
            }
          >
            Edit
          </Button>

          <Button
            variant="destructive"
            disabled={deleting}
            className="bg-red-600 hover:bg-red-500 text-xs"
            onClick={handleDelete}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-xs text-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {!error && loadingTalent && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-10 text-center text-sm text-neutral-400">
          Loading talent profile…
        </div>
      )}

      {!error && !loadingTalent && talent && (
        <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/70">
          <div className="border-b border-neutral-800/80 bg-gradient-to-r from-purple-900/30 via-neutral-900 to-neutral-950 px-6 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300/80">
              Talent profile
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Agency view — keep it current or it becomes useless.
            </p>
          </div>

          <Card className="border-0 bg-transparent p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Avatar className="h-20 w-20">
                {talent.profile_image_url ? (
                  <AvatarImage src={talent.profile_image_url} alt={talent.full_name} />
                ) : (
                  <AvatarFallback>
                    {talent.full_name
                      ?.split(" ")
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 3) || "T"}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1 space-y-1">
                <h1 className="text-2xl font-semibold text-white">{talent.full_name}</h1>
                <div className="text-sm text-neutral-300">{talent.profession}</div>
                <div className="text-xs text-neutral-500">{talent.location}</div>
              </div>

              <div className="md:text-right">
                <div className="text-xs uppercase tracking-wide text-neutral-500">
                  Day rate
                </div>
                <div className="text-2xl font-semibold text-neutral-100">
                  £{talent.day_rate.toFixed(0)}
                </div>
              </div>
            </div>

            {talent.skills && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Skills
                </div>
                <div className="mt-2 text-sm text-neutral-200 whitespace-pre-line">
                  {talent.skills}
                </div>
              </div>
            )}

            {talent.bio && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Bio
                </div>
                <div className="mt-2 text-sm text-neutral-200 whitespace-pre-line">
                  {talent.bio}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {!error && !loadingTalent && !talent && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-10 text-center text-sm text-neutral-400">
          Talent not found or you don&apos;t have access to this profile.
        </div>
      )}
    </div>
  );
}