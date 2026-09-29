import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, CalendarDays, Check, UsersRound } from "lucide-react";

const primary = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400";
const secondary = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-100 transition hover:border-purple-400 hover:bg-purple-500/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400";
const roles = [
  { name: "Professionals", icon: BriefcaseBusiness, title: "Your expertise. Your next opportunity.", description: "Give your skills a home, share your availability and explore contract and interim roles.", points: ["Create your professional profile", "Keep your availability up to date", "Apply for opportunities"], action: "Find contract work", role: "professional" },
  { name: "Companies", icon: Building2, title: "Find the people your project needs.", description: "Bring your requirements together and connect with professionals for your next contract role.", points: ["Post your contract roles", "Review profiles and applications", "Send booking requests"], action: "Find talent", role: "company" },
  { name: "Agencies", icon: UsersRound, title: "Keep your talent in one place.", description: "Manage your professional roster and keep talent profiles ready for the next opportunity.", points: ["Create your agency account", "Manage your talent roster", "Maintain professional profiles"], action: "Join as an agency", role: "agency" },
];

export default function HomePage() {
  return (
    <main id="top" className="min-h-screen overflow-x-clip bg-black text-neutral-100 selection:bg-purple-500/40">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-purple-600 focus:p-4">Skip to content</a>
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href="/" aria-label="ContractPros UK home" className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-purple-400">
            <Image src="/company-logo-new.png" alt="ContractPros UK" width={150} height={105} priority className="h-auto w-[105px] sm:w-[140px]" />
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-6">
            <a href="#who-its-for" className="hidden text-sm text-neutral-300 transition hover:text-purple-300 lg:block">Who it’s for</a>
            <a href="#how-it-works" className="hidden text-sm text-neutral-300 transition hover:text-purple-300 lg:block">How it works</a>
            <Link href="/login" className="px-1 py-3 text-sm font-medium text-neutral-200 hover:text-purple-300">Log in</Link>
            <Link href="/register" className={`${primary} px-4 sm:px-5`}>Get started <ArrowRight size={16} aria-hidden="true" className="hidden sm:block" /></Link>
          </nav>
        </div>
      </header>

      <section id="main-content" className="relative scroll-mt-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_35%,rgba(126,34,206,0.18),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-24">
          <div>
            <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-purple-300"><span className="h-1.5 w-1.5 rounded-full bg-purple-400" />Contract & interim opportunities</p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-[64px]">Great people.<br />The right projects.<br /><span className="text-purple-400">Connected.</span></h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-neutral-400 sm:text-lg">A home for contract professionals, companies and agencies. Showcase your expertise or find the talent to move your next project forward.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register?role=company" className={primary}>I’m looking for talent <ArrowRight size={17} aria-hidden="true" /></Link>
              <Link href="/register?role=professional" className={secondary}>I’m looking for work</Link>
            </div>
            <p className="mt-5 text-sm text-neutral-500">Represent an agency? <Link href="/register?role=agency" className="text-purple-300 underline decoration-purple-300/40 underline-offset-4 hover:text-purple-200">Join ContractPros</Link></p>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950">
              <div className="relative aspect-[5/4]">
                <Image src="https://images.unsplash.com/photo-1522071901873-411886a10004?auto=format&fit=crop&w=1600&q=80" alt="Professionals working together around a table" fill sizes="(max-width: 1023px) 100vw, 550px" priority className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-black/10 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6"><p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-200">Made for contract work</p><p className="mt-2 text-2xl font-semibold tracking-tight">Expertise meets opportunity.</p></div>
              </div>
              <div className="flex items-start gap-4 px-6 pb-7 pt-2"><span className="rounded-xl border border-purple-400/20 bg-purple-500/10 p-3 text-purple-300"><CalendarDays size={23} aria-hidden="true" /></span><div><p className="font-medium">Make your next move with clarity</p><p className="mt-1 text-sm leading-6 text-neutral-400">Profiles, availability and applications.<br className="hidden sm:block" /> Together in one place.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-neutral-800/80 bg-neutral-950/70"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-6 text-sm text-neutral-400 sm:px-8"><span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Expertise across</span>{["Engineering", "Operations", "Quality", "Technical", "Maintenance", "Project management"].map(area => <span key={area}>{area}</span>)}</div></div>

      <section id="who-its-for" className="mx-auto max-w-7xl scroll-mt-8 px-5 py-16 sm:px-8 sm:py-24">
        <div className="mb-10 max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">Find your place</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Different goals. One place to connect.</h2><p className="mt-4 leading-7 text-neutral-400">Choose the account that fits the way you work.</p></div>
        <div className="grid gap-5 lg:grid-cols-3">{roles.map(({ name, icon: Icon, title, description, points, action, role }) => <article key={role} className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8"><div className="mb-7 flex items-center gap-3"><span className="rounded-xl bg-purple-500/10 p-3 text-purple-300"><Icon size={22} aria-hidden="true" /></span><p className="text-sm font-medium text-purple-200">{name}</p></div><h3 className="text-2xl font-semibold leading-snug tracking-tight">{title}</h3><p className="mt-4 text-sm leading-7 text-neutral-400">{description}</p><ul className="mb-8 mt-6 space-y-3">{points.map(point => <li key={point} className="flex gap-3 text-sm text-neutral-300"><Check size={17} className="shrink-0 text-purple-400" aria-hidden="true" />{point}</li>)}</ul><Link href={`/register?role=${role}`} className={`${secondary} mt-auto justify-between px-4`}>{action}<ArrowRight size={17} aria-hidden="true" /></Link></article>)}</div>
      </section>

      <section id="how-it-works" className="border-y border-neutral-800/80 bg-neutral-950/60">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">How it works</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your next chapter<br />starts here.</h2><p className="mt-5 max-w-sm leading-7 text-neutral-400">From introducing yourself to exploring your next opportunity, start with the essentials.</p><Link href="/register" className="mt-6 inline-flex items-center gap-2 py-2 font-medium text-purple-300 hover:text-purple-200">Create your account <ArrowRight size={18} aria-hidden="true" /></Link></div>
          <ol className="space-y-8">{[{ title: "Choose how you’ll use ContractPros", text: "Join as a professional, company or agency and set up your account." }, { title: "Tell us what you bring — or what you need", text: "Build a professional profile, add your talent or post a role with your requirements." }, { title: "Take the next step", text: "Explore roles, review applications and manage booking requests through your account." }].map((step, i) => <li key={step.title} className="flex gap-5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 text-sm font-semibold text-purple-300">0{i + 1}</span><div className="pt-1"><h3 className="text-lg font-medium">{step.title}</h3><p className="mt-2 text-sm leading-7 text-neutral-400">{step.text}</p></div></li>)}</ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20"><div className="relative overflow-hidden rounded-3xl border border-purple-500/25 bg-[radial-gradient(ellipse_at_top_right,rgba(126,34,206,0.22),transparent_70%)] px-6 py-12 text-center sm:px-12 sm:py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">Let’s get to work</p><h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Your next connection starts with a profile.</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-neutral-400">Whether you’re finding your next contract or building your team, make ContractPros your starting point.</p><Link href="/register" className={`${primary} mt-8`}>Get started <ArrowRight size={17} aria-hidden="true" /></Link></div></section>
      <footer className="border-t border-neutral-800"><div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 py-8 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left"><div><p className="font-semibold text-neutral-200">ContractPros <span className="text-purple-400">UK</span></p><p className="mt-2 text-xs text-neutral-500">© {new Date().getFullYear()} ContractPros. All rights reserved.</p></div><nav aria-label="Footer navigation" className="flex gap-6 text-sm text-neutral-400"><Link href="/login" className="py-2 hover:text-purple-300">Log in</Link><Link href="/register" className="py-2 hover:text-purple-300">Create account</Link><a href="#top" className="py-2 hover:text-purple-300">Back to top ↑</a></nav></div></footer>
    </main>
  );
}
