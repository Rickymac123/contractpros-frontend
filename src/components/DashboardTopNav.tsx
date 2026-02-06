// src/components/DashboardTopNav.tsx
import Link from "next/link";

export type TopNavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export default function DashboardTopNav({
  items,
  className = "",
}: {
  items: TopNavItem[];
  className?: string;
}) {
  if (!items?.length) return null;

  return (
    <div className={`mx-auto max-w-6xl px-4 ${className}`}>
      <nav className="mt-4 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-neutral-800/80 bg-neutral-950/70 px-2 py-2 shadow-[0_0_40px_rgba(0,0,0,0.55)] backdrop-blur">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-transparent bg-neutral-900/40 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-purple-500/40 hover:bg-neutral-900/70"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}