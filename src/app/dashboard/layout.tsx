// src/app/dashboard/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import type { ReactNode } from "react";
import DashboardHeader from "@/components/DashboardHeader";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = (await cookies()).get("backend_session")?.value;
  if (!session) redirect("/login");
  const response = await fetch(`${API_BASE_URL}/users/me`, {headers:{Cookie:session}, cache:"no-store", signal:AbortSignal.timeout(15000)});
  if (response.status === 401 || response.status === 403) redirect("/login");
  if (!response.ok) throw new Error("Your account could not be loaded. Please try again shortly.");
  const user = await response.json();
  if (!user.is_active || !user.is_verified) redirect("/login?error=LOGIN_USER_NOT_VERIFIED");
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_55%)]" />

      <div className="relative">
        <DashboardHeader />
        <main className="mx-auto min-w-0 max-w-6xl px-4 py-8">{children}</main>
      </div>
    </div>
  );
}