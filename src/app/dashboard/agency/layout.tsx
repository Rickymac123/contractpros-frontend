// src/app/dashboard/agency/layout.tsx
import type { ReactNode } from "react";
import DashboardTopNav from "@/components/DashboardTopNav";

export default function AgencyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_55%)]" />

      <div className="relative">
       

        <DashboardTopNav
          items={[
            { href: "/dashboard/agency", label: "Dashboard" },
            { href: "/dashboard/agency/talent", label: "Talent" },
            { href: "/dashboard/agency/applications", label: "Applications" },
          ]}
        />

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </div>
  );
}