"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function AgencyTalentListPage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();

  const [talent, setTalent] = useState<Talent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingTalent, setLoadingTalent] = useState(true);

  // Enforce agency role
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
    else if (role === "admin") router.replace("/dashboard/admin");
  }, [user, loading, router]);

  // Load talent for this agency
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyUser = user as any;
    const role: string =
      anyUser?.is_superuser || anyUser?.role === "admin"
        ? "admin"
        : anyUser?.role || "company";

    if (!user || role !== "agency") return;

    const load = async () => {
      setLoadingTalent(true);
      setError(null);

      try {
        const res = await fetch("/api/agency/talent", { cache: "no-store" });
        const text = await res.text();

        if (!res.ok) {
          let detail: unknown = text;
          try {
            const parsed = text ? JSON.parse(text) : null;
            if (parsed && typeof parsed === "object" && "detail" in parsed) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              detail = (parsed as any).detail ?? detail;
            }
          } catch {
            // ignore
          }

          setError(
            typeof detail === "string" ? detail : "Failed to load talent list",
          );
          setTalent([]);
          return;
        }

        const data = text ? JSON.parse(text) : [];
        setTalent(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(
          typeof err?.message === "string"
            ? err.message
            : "Failed to load talent list",
        );
        setTalent([]);
      } finally {
        setLoadingTalent(false);
      }
    };

    load();
  }, [user]);

  // Flattened: no page-level min-h-screen/bg/text; layout provides it
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Talent</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Manage your agency&apos;s talent pool and view profiles at a glance.
          </p>
        </div>

        <Button
          onClick={() => router.push("/dashboard/agency/talent/new")}
          className="bg-purple-600 hover:bg-purple-500 text-sm"
        >
          + New talent
        </Button>
      </div>

      {/* States */}
      {(loading || !user || loadingTalent) && !error && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-10 text-center text-sm text-neutral-400">
          Loading…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-6 py-4 text-sm text-red-200">
          <p className="font-medium">Failed to load talent</p>
          <p className="mt-1 break-all text-xs text-red-200/80">{error}</p>
        </div>
      )}

      {!error && !loadingTalent && talent.length === 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-6 py-8 text-sm text-neutral-300">
          You haven&apos;t added any talent profiles yet. Use{" "}
          <span className="text-purple-300 font-medium">New talent</span> to
          create your first profile.
        </div>
      )}

      {!error && !loadingTalent && talent.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {talent.map((t) => (
            <Card
              key={t.id}
              onClick={() => router.push(`/dashboard/agency/talent/${t.id}`)}
              className="flex cursor-pointer gap-4 border border-neutral-800 bg-neutral-950/70 p-4 transition hover:border-purple-500/50"
            >
              <Avatar className="h-14 w-14 shrink-0">
                {t.profile_image_url ? (
                  <AvatarImage src={t.profile_image_url} alt={t.full_name} />
                ) : (
                  <AvatarFallback>
                    {t.full_name
                      ?.split(" ")
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 3) || "T"}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {t.full_name}
                    </div>
                    <div className="text-xs text-neutral-400">{t.profession}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-purple-300">
                      £{t.day_rate.toFixed(0)}/day
                    </div>
                    <div className="text-xs text-neutral-500">{t.location}</div>
                  </div>
                </div>

                {t.skills && (
                  <div className="pt-2 text-xs text-neutral-400 line-clamp-2">
                    {t.skills}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}