"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getPlatformStatsAction, getAllRestaurantsAction } from "@/app/actions/admin.actions";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [recentBusinesses, setRecentBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, bizRes] = await Promise.all([
        getPlatformStatsAction(),
        getAllRestaurantsAction(),
      ]);

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (bizRes.success && bizRes.restaurants) {
        setRecentBusinesses(bizRes.restaurants.slice(0, 5));
      }
    } catch (err) {
      console.error("Admin stats fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Super Admin Control Center
          </h1>
          <p className="text-xs text-slate-400">
            Platform metrics, business signups, active subscriptions & system status
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          leftIcon={<RefreshCw size={14} />}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Refresh Platform Metrics
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Businesses"
          value={stats?.totalRestaurants || 0}
          change={`+${stats?.newSignups || 0} this month`}
          trend="up"
          icon={Building2}
        />
        <StatCard
          title="Active Paid Accounts"
          value={stats?.activeRestaurants || 0}
          change="SaaS Active"
          trend="up"
          icon={CreditCard}
        />
        <StatCard
          title="Active Trials"
          value={stats?.trialRestaurants || 0}
          change={`${stats?.expiringTrials || 0} expiring soon`}
          trend="neutral"
          icon={Users}
        />
        <StatCard
          title="Est. MRR (Monthly)"
          value={`₹${((stats?.activeRestaurants || 0) * 499).toLocaleString()}`}
          change="Recurring"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions & Recent Businesses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent Registered Businesses */}
        <div className="lg:col-span-2 bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-heading flex items-center gap-1.5">
              <Building2 size={16} className="text-amber-400" /> Recent Business Signups
            </h2>
            <Link
              href="/admin/businesses"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              View All Businesses <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentBusinesses.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No businesses registered yet.</p>
            ) : (
              recentBusinesses.map((biz) => (
                <div
                  key={biz._id}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{biz.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      /{biz.slug} • {biz.type?.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={biz.subscription?.plan === "trial" ? "warning" : "success"}
                      size="sm"
                    >
                      {biz.subscription?.plan?.toUpperCase() || "TRIAL"}
                    </Badge>
                    <Link href={`/${biz.slug}`} target="_blank">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        Preview Menu ↗
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-heading flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <ShieldCheck size={16} className="text-amber-400" /> Master Controls
          </h2>

          <div className="space-y-2">
            <Link href="/admin/businesses">
              <Button
                variant="outline"
                className="w-full justify-between border-slate-800 text-slate-200 hover:bg-slate-900"
              >
                <span>Manage Businesses & Suspend</span>
                <ArrowRight size={14} />
              </Button>
            </Link>

            <Link href="/admin/subscriptions">
              <Button
                variant="outline"
                className="w-full justify-between border-slate-800 text-slate-200 hover:bg-slate-900"
              >
                <span>Manual Plan Overrides</span>
                <ArrowRight size={14} />
              </Button>
            </Link>

            <Link href="/admin/settings">
              <Button
                variant="outline"
                className="w-full justify-between border-slate-800 text-slate-200 hover:bg-slate-900"
              >
                <span>Platform Config & Pricing</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
