import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/auth";

/**
 * Small hook to load the current user from /api/auth/me.
 * - loading: true while fetching
 * - user: AuthUser | null
 * - error: string | null (non-401 errors)
 */
export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (cancelled) return;

        if (res.status === 401) {
          // Not authenticated
          setUser(null);
          setLoading(false);
          return;
        }

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
            // ignore parse error
          }

          setError(
            typeof detail === "string"
              ? detail
              : `AUTH_ME_STATUS_${res.status}`,
          );
          setUser(null);
          setLoading(false);
          return;
        }

        const data = text ? JSON.parse(text) : null;
        setUser(data as AuthUser);
        setLoading(false);
      } catch (err: any) {
        if (cancelled) return;
        setError(
          typeof err?.message === "string"
            ? err.message
            : "Failed to load current user",
        );
        setUser(null);
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading, error };
}
