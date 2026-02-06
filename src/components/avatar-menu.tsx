"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AvatarMenuProps = {
  email?: string | null;
};

function initialsFromEmail(email?: string | null) {
  if (!email) return "U";
  const name = email.split("@")[0] ?? "user";
  const parts = name.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(" ").filter(Boolean);
  const a = (parts[0]?.[0] ?? "U").toUpperCase();
  const b = (parts[1]?.[0] ?? "").toUpperCase();
  return (a + b).slice(0, 2);
}

export default function AvatarMenu({ email }: AvatarMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initials = useMemo(() => initialsFromEmail(email), [email]);

  const signOut = async () => {
    try {
      await fetch("/api/logout", { method: "POST" }).catch(() => null);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-950/70 text-xs font-semibold text-neutral-100 hover:bg-neutral-900"
        aria-haspopup="menu"
        aria-expanded={open}
        title={email ?? "Account"}
      >
        {initials}
      </button>

      {open && (
        <>
          {/* click-away */}
          <button
            type="button"
            className="fixed inset-0 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />

          <div
            className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            role="menu"
          >
            <div className="border-b border-neutral-800 px-3 py-2">
              <div className="text-[11px] uppercase tracking-wide text-neutral-500">Signed in as</div>
              <div className="mt-0.5 truncate text-xs text-neutral-200">{email ?? "—"}</div>
            </div>

            <div className="p-1">
              <Link
                href="/dashboard/account"
                onClick={() => setOpen(false)}
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
        </>
      )}
    </div>
  );
}