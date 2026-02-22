"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type LoggedInUser = {
  role?: string | null;
  is_superuser?: boolean | null;
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const created = searchParams.get("created");
    if (created === "1") {
      setInfo("Account created. Check your email for the verification link.");
    } else {
      setInfo(null);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(extractDetail(text, res.status));
        setLoading(false);
        return;
      }

      // /api/login returns { user } on success
      let role = "company";
      try {
        const parsed = text ? JSON.parse(text) : null;
        const user: LoggedInUser | null = parsed?.user ?? null;
        role =
          (user?.role ?? (user?.is_superuser ? "admin" : "company")) || "company";
      } catch {
        role = "company";
      }

      if (role === "professional") router.replace("/dashboard/professional");
      else if (role === "agency") router.replace("/dashboard/agency");
      else if (role === "admin") router.replace("/dashboard/admin");
      else router.replace("/dashboard/company");
    } catch (err: any) {
      setError(typeof err?.message === "string" ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-950/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <header className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-white">Contract Pro&apos;s UK</h1>
          <p className="text-sm text-neutral-400">Sign in to your dashboard</p>
        </header>

        {info && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
            {info}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-neutral-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-purple-600 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-400">
          Don’t have an account?{" "}
          <Link href="/register" className="text-purple-300 hover:text-purple-200">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}