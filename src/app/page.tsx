import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Subtle background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_10%,rgba(124,58,237,0.20),transparent_60%),radial-gradient(800px_450px_at_90%_20%,rgba(168,85,247,0.18),transparent_55%),radial-gradient(700px_420px_at_50%_90%,rgba(59,130,246,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55),rgba(0,0,0,0.85))]" />
      </div>

      {/* Top nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          {/* If you already have a logo path, change src */}
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-purple-500/35 bg-neutral-900/60">
            <Image
              src="/company-logo.png"
              alt="Contract Pros"
              fill
              className="object-contain p-1.5"
              priority
            />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Contract Pros</p>
            <p className="text-[11px] text-neutral-400">Interim & contract talent marketplace</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-xs font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-950/70"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-purple-500/40 bg-purple-950/30 px-3 py-2 text-xs font-semibold text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-950/45"
          >
            Create account
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/20 px-3 py-1 text-[11px] font-semibold tracking-wide text-purple-100">
              Built for speed. Designed for trust.
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Find verified contract professionals.
              <span className="block text-purple-200">Fill roles fast — without the chaos.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-300">
              Contract Pros connects companies with proven interim and contract talent across
              multiple sectors. Post roles, review applications, and onboard the right people —
              faster, cleaner, and with better visibility than traditional back-and-forth.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-2xl border border-purple-500/45 bg-purple-950/30 px-4 py-2.5 text-sm font-semibold text-purple-100 transition hover:border-purple-400/70 hover:bg-purple-950/45"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-neutral-800 bg-neutral-950/40 px-4 py-2.5 text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-950/70"
              >
                I already have an account
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Stat label="Faster hires" value="Days, not weeks" />
              <Stat label="Clear matching" value="Skills-first" />
              <Stat label="Role types" value="Interim · Contract" />
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/50 shadow-[0_0_35px_rgba(0,0,0,0.55)]">
              <div className="relative h-[320px] w-full sm:h-[380px]">
                {/* Stock image (Unsplash). No account required. */}
                <Image
                  src="https://images.unsplash.com/photo-1522071901873-411886a10004?auto=format&fit=crop&w=1600&q=80"
                  alt="Professionals collaborating"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.75),rgba(0,0,0,0.05))]" />
              </div>

              <div className="grid gap-3 px-5 py-5 sm:grid-cols-2">
                <Feature
                  title="Verified profiles"
                  desc="Structured data, clear history, and role-fit signals — not vague CV blur."
                />
                <Feature
                  title="Simple workflows"
                  desc="Post, shortlist, interview, and book — with fewer moving parts."
                />
                <Feature
                  title="Sector-agnostic"
                  desc="Engineering, ops, tech, project delivery, and beyond."
                />
                <Feature
                  title="Built to scale"
                  desc="A platform you can grow into as demand ramps up."
                />
              </div>
            </div>

            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.2rem] bg-[radial-gradient(550px_240px_at_60%_40%,rgba(124,58,237,0.25),transparent_65%)]" />
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <h2 className="text-lg font-semibold">What Contract Pros is</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">
              A professional marketplace where companies can source vetted interim and contract
              talent, and professionals can find roles that match their skills, availability, and
              expectations.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Who it’s for</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-300">
              <li className="flex gap-2">
                <Bullet /> Hiring managers needing speed and clarity.
              </li>
              <li className="flex gap-2">
                <Bullet /> Contractors who want better-fit work, not noise.
              </li>
              <li className="flex gap-2">
                <Bullet /> Agencies (optional) who want structured placements.
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">What makes it different</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">
              Fewer spreadsheets. Less chasing. More signal. Contract Pros focuses on clean data,
              fast shortlisting, and a workflow that stays usable when you’re busy.
            </p>
          </Card>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-14">
        <div className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/55 shadow-[0_0_35px_rgba(0,0,0,0.55)]">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="relative h-[260px] lg:h-full">
              {/* Stock image */}
              <Image
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80"
                alt="Modern work setup"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.80),rgba(0,0,0,0.15))]" />
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200/90">
                Mission statement
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Make hiring contract talent straightforward, transparent, and fast.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-300">
                Contract Pros exists to remove friction from interim and contract hiring.
                We’re building a platform where companies can move quickly without sacrificing
                quality, and professionals can find roles that respect their skills, time, and rate.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <ValuePill title="Trust by design" desc="Clear roles, clean data, less ambiguity." />
                <ValuePill title="Speed with control" desc="Fast pipelines without messy processes." />
                <ValuePill title="Professional first" desc="Built for real-world contract work." />
                <ValuePill title="Evolve and scale" desc="A foundation that grows with demand." />
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-2xl border border-purple-500/45 bg-purple-950/30 px-4 py-2.5 text-sm font-semibold text-purple-100 transition hover:border-purple-400/70 hover:bg-purple-950/45"
                >
                  Create your profile
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-2xl border border-neutral-800 bg-neutral-950/40 px-4 py-2.5 text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-950/70"
                >
                  Go to dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900/80 bg-neutral-950/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Contract Pros. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-neutral-500">
            <Link href="/login" className="hover:text-neutral-300">Log in</Link>
            <Link href="/register" className="hover:text-neutral-300">Sign up</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-neutral-100">{value}</p>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/35 px-4 py-3">
      <p className="text-sm font-semibold text-neutral-100">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-neutral-400">{desc}</p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950/55 p-6 shadow-[0_0_25px_rgba(0,0,0,0.45)]">
      {children}
    </div>
  );
}

function Bullet() {
  return (
    <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full border border-purple-500/60 bg-purple-950/30" />
  );
}

function ValuePill({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/45 px-4 py-3">
      <p className="text-sm font-semibold text-neutral-100">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-neutral-400">{desc}</p>
    </div>
  );
}