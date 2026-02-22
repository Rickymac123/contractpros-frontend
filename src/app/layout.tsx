import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

const SITE_URL = "https://www.contractpros.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ContractPros UK – Contract & Interim Recruitment Made Easy",
    template: "%s | ContractPros UK",
  },
  description:
    "ContractPros connects companies with verified contract and interim professionals. Post roles fast, match by availability, and hire with confidence.",
  applicationName: "ContractPros",
  alternates: { canonical: "/" },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ContractPros",
    title: "ContractPros UK – Contract & Interim Recruitment Made Easy",
    description:
      "Connect with verified contract and interim professionals. Match by availability and hire faster.",
    images: [
      {
        url: "/company-logo-new.png",
        width: 1200,
        height: 630,
        alt: "ContractPros",
      },
    ],
    locale: "en_GB",
  },

  twitter: {
    card: "summary_large_image",
    title: "ContractPros UK",
    description:
      "Connect with verified contract and interim professionals. Match by availability and hire faster.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
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