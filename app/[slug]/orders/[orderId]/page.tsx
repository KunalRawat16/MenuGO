import React from "react";
import { notFound } from "next/navigation";
import { getOrderByIdPublicAction } from "@/app/actions/order.actions";
import { OrderStatusTracker } from "@/components/menu/OrderStatusTracker";

interface PageProps {
  params: Promise<{ slug: string; orderId: string }>;
}

export default async function CustomerOrderTrackingPage({ params }: PageProps) {
  const { slug, orderId } = await params;

  const res = await getOrderByIdPublicAction(orderId);

  if (!res.success || !res.order) {
    notFound();
  }

  return <OrderStatusTracker initialOrder={res.order} slug={slug} />;
}
