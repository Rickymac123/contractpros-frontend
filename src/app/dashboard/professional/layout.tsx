import type { ReactNode } from "react";
import DashboardTopNav from "@/components/DashboardTopNav";

export default function ProfessionalDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <DashboardTopNav
        items={[
          { href: "/dashboard/professional", label: "Overview" },
          { href: "/dashboard/professional/applications", label: "Applications" },
          { href: "/dashboard/professional/booking-requests", label: "Booking requests" },
          { href: "/dashboard/professional/profile", label: "Profile" },
          { href: "/dashboard/professional/preview", label: "Preview" },
          { href: "/dashboard/professional/availability", label: "Availability" },
        ]}
      />
      <div>{children}</div>
    </>
  );
}