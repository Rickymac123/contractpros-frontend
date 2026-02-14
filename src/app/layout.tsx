import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Contract Pro's UK – Temp Recruitment Made Easy",
  description: "Company dashboard",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Global gradient glow */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_55%)]" />

        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}