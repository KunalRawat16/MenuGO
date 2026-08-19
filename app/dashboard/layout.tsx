import React from "react";
import { getMyBusinessAction } from "@/app/actions/restaurant.actions";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const res = await getMyBusinessAction();

  if (!res.success || !res.business) {
    redirect("/auth/login");
  }

  return <DashboardShell business={res.business}>{children}</DashboardShell>;
}
