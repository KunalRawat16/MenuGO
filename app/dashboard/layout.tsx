import React from "react";
import { getMyBusinessAction } from "@/app/actions/restaurant.actions";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const res = await getMyBusinessAction();

  if (!res.success || !res.business) {
    redirect("/auth/login");
  }

  return (
    <DashboardShell business={res.business} isImpersonating={!!session?.isImpersonating}>
      {children}
    </DashboardShell>
  );
}
