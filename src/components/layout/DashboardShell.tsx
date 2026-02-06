"use client";

import React from "react";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardShell({
  title,
  subtitle,
  rightSlot,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Global glow background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_55%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
            )}
          </div>
          {rightSlot && <div className="flex items-center gap-3">{rightSlot}</div>}
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}