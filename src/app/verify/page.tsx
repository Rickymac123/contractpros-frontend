"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const search = useSearchParams();
  const token = search.get("token") ?? "";

  const [status, setStatus] = useState<"idle" | "working" | "ok" | "fail">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus("fail");
        setMessage("Missing token.");
        return;
      }

      setStatus("working");
      setMessage("");

      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const text = await res.text();

      if (!res.ok) {
        setStatus("fail");
        setMessage(text || `STATUS ${res.status}`);
        return;
      }

      setStatus("ok");
      setMessage("Email verified. You can sign in now.");
    };

    run();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-950/70 p-6 text-white shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <h1 className="text-xl font-semibold">Verify email</h1>
        <p className="mt-2 text-sm text-neutral-400">
          {status === "working" ? "Verifying…" : message}
        </p>

        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-lg bg-purple-600 py-2 text-sm font-medium text-white hover:bg-purple-500"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}