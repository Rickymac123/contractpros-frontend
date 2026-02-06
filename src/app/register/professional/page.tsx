"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfessionalSignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [postcode, setPostcode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: "professional",
          first_name: firstName,
          last_name: lastName,
          phone: "-",            // required by backend
          address_line1: "-",     // required by backend
          address_line2: "-",
          city: "-",
          postcode,
          country: "UK",
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        try {
          const parsed = JSON.parse(text);
          setError(parsed?.detail ?? "Signup failed");
        } catch {
          setError(text || "Signup failed");
        }
        return;
      }

      // Registration successful → send to profile completion
      router.replace("/dashboard/professional/profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_55%)]" />

      <div className="relative mx-auto max-w-xl px-4 py-12">
        <div className="rounded-3xl border border-neutral-800/80 bg-neutral-950/60 shadow-[0_0_40px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="border-b border-neutral-800/80 px-6 py-4">
            <h1 className="text-xl font-semibold tracking-tight">
              Professional signup
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Create your account — profile details come next.
            </p>
          </div>

          <div className="px-6 py-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="First name">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Last name">
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                />
              </Field>
            </div>

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Postcode">
              <input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="input"
              />
            </Field>

            <div className="flex justify-end pt-2">
              <button
                onClick={submit}
                disabled={loading}
                className="rounded-xl border border-purple-500/70 bg-purple-700/30 px-5 py-2 text-sm font-medium text-purple-50 transition hover:border-purple-400 hover:bg-purple-600/40 disabled:opacity-60"
              >
                {loading ? "Creating…" : "Create account"}
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              You’ll complete your professional profile next.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-neutral-300">{label}</div>
      {children}
    </div>
  );
}