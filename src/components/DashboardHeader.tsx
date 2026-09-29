"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Me = {
  id?: string;
  email?: string;
  role?: string;
  full_name?: string | null;
};

function initials(nameOrEmail: string) {
  const s = (nameOrEmail || "").trim();
  if (!s) return "U";
  const parts = s.includes(" ") ? s.split(/\s+/).filter(Boolean) : [s];
  const first = parts[0]?.[0] ?? "U";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1] ?? "";
  return (first + second).toUpperCase();
}

function extractDetail(text: string, status: number) {
  if (!text) return `STATUS ${status}: EMPTY`;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && "detail" in parsed) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detail = (parsed as any).detail;
      return typeof detail === "string" ? detail : JSON.stringify(detail);
    }
  } catch {
    // ignore
  }
  return `STATUS ${status}: ${text}`;
}

export default function DashboardHeader() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(() => me?.full_name?.trim() || me?.email || "", [me]);
  const avatarText = useMemo(() => initials(displayName || "user"), [displayName]);

  const goHome = () => {
    if (me?.role === "admin") router.push("/dashboard/admin");
    else if (me?.role === "professional") router.push("/dashboard/professional");
    else if (me?.role === "agency") router.push("/dashboard/agency");
    else router.push("/dashboard/company");
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Me;
        setMe(data);
      } catch {
        // ignore
      }
    })();
  }, []);

  // Close menu on outside click / ESC
  useEffect(() => {
    if (!menuOpen) return;

    const onDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const signOut = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(extractDetail(text, res.status));
      }
    } catch {
      // still route away; worst case cookie is already dead locally
    } finally {
      setMenuOpen(false);
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Left: logo + brand (clickable home) */}
        <button
          type="button"
          onClick={goHome}
          className="flex items-center gap-3 text-left"
          title="Go to dashboard"
        >
          <div className="relative h-15 w-50">
            <Image
              src="/company-logo-new.png"
              alt="Contractpros"
              fill
              unoptimized
              className="object-contain"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">Contract Pro's UK</div>
            <div className="text-xs text-neutral-400">Professional Contract Solutions</div>
          </div>
        </button>

        {/* Right: user + avatar dropdown */}
        <div className="flex items-center gap-3" ref={menuRef}>
          <div className="hidden text-right sm:block">
            <div className="text-xs font-medium text-neutral-200">{displayName || "Signed in"}</div>
            {me?.role && <div className="text-[11px] text-neutral-500">{me.role}</div>}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-500/40 bg-purple-950/40 text-xs font-semibold text-purple-100 shadow-[0_0_25px_rgba(168,85,247,0.25)] transition hover:bg-purple-900/40"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title={me?.email ?? "Account"}
            >
              {avatarText}
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                role="menu"
              >
                <div className="border-b border-neutral-800 px-3 py-2">
                  <div className="text-[11px] uppercase tracking-wide text-neutral-500">
                    Signed in as
                  </div>
                  <div className="mt-0.5 truncate text-xs text-neutral-200">{me?.email ?? "—"}</div>
                </div>

                <div className="p-1">
                  <Link
                    href="/dashboard/account"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
                    role="menuitem"
                  >
                    My account
                  </Link>

                  <button
                    type="button"
                    onClick={signOut}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-200 hover:bg-red-950/40"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}