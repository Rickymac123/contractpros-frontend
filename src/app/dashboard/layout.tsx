// src/app/dashboard/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import type { ReactNode } from "react";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import DashboardHeader from "@/components/DashboardHeader";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = (await cookies()).get("backend_session")?.value;
  if (!session) redirect("/login");
  const response = await fetch(`${API_BASE_URL}/users/me`, {headers:{Cookie:session}, cache:"no-store", signal:AbortSignal.timeout(15000)});
  if (response.status === 401 || response.status === 403) redirect("/login");
  if (!response.ok) throw new Error("Your account could not be loaded. Please try again shortly.");
  const user = await response.json();
  if (!user.is_active || !user.is_verified) redirect("/login?error=LOGIN_USER_NOT_VERIFIED");
  return <div className="cp-workspace"><WorkspaceSidebar role={user.role} email={user.email}/><div className="cp-workspace-main"><DashboardHeader/><main className="cp-content">{children}</main></div></div>;
}
