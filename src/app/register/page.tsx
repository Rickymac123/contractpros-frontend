"use client";

import Link from "next/link";

const options = [
  {
    title: "Professional",
    desc: "Create your contractor profile, upload your CV, set rates and availability.",
    href: "/register/professional",
    badge: "Talent",
  },
  {
    title: "Company",
    desc: "Post roles, review applicants, and book professionals.",
    href: "/register/company/profile",
    badge: "Hiring",
  },
  {
    title: "Agency",
    desc: "Manage a talent pool and submit candidates to companies.",
    href: "/register/agency/profile",
    badge: "Recruitment",
  },
];

export default function RegisterSelectPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background glow — same as dashboards */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 space-y-10">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl">
            Pick the profile you actually need. Switching later is possible,
            but painful — choose properly.
          </p>
        </header>

        {/* Options */}
        <div className="grid gap-4 md:grid-cols-3">
          {options.map((o) => (
            <Link
              key={o.title}
              href={o.href}
              className="group rounded-3xl border border-neutral-800/80 bg-neutral-950/60 p-6 shadow-[0_0_40px_rgba(0,0,0,0.55)] transition hover:border-purple-500/40 hover:bg-neutral-950/70"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">
                  {o.title}
                </h2>
                <span className="rounded-full border border-neutral-700 bg-neutral-900/70 px-2.5 py-1 text-[11px] text-neutral-200">
                  {o.badge}
                </span>
              </div>

              <p className="mt-2 text-sm text-neutral-400">
                {o.desc}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-purple-200">
                Continue
                <span className="transition group-hover:translate-x-0.5">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer link */}
        <div>
          <Link
            href="/auth/login"
            className="text-sm text-neutral-400 underline decoration-neutral-700 underline-offset-4 hover:text-neutral-200"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}