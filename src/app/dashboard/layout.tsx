
import { Suspense, type ReactNode } from "react";
import DashboardContent from "./dashboardContent";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
