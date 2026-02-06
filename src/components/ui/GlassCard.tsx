import React from "react";

export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "overflow-hidden rounded-3xl border border-neutral-800/80",
        "bg-gradient-to-b from-neutral-900/80 to-black/90",
        "shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}