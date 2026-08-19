import React from "react";
import { notFound } from "next/navigation";
import { getOrderByIdPublicAction } from "@/app/actions/order.actions";
import { getBusinessBySlugAction } from "@/app/actions/restaurant.actions";
import { OrderStatusTracker } from "@/components/menu/OrderStatusTracker";

interface PageProps {
  params: Promise<{ slug: string; orderId: string }>;
}

export default async function CustomerOrderTrackingPage({ params }: PageProps) {
  const { slug, orderId } = await params;

  const [orderRes, bizRes] = await Promise.all([
    getOrderByIdPublicAction(orderId),
    getBusinessBySlugAction(slug),
  ]);

  if (!orderRes.success || !orderRes.order) {
    notFound();
  }

  const business = bizRes.success && bizRes.business ? bizRes.business : null;

  return <OrderStatusTracker initialOrder={orderRes.order} slug={slug} business={business} />;
}
