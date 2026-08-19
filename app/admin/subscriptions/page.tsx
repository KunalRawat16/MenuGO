"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Calendar, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  getAllRestaurantsAction,
  updateSubscriptionAction,
} from "@/app/actions/admin.actions";

export default function AdminSubscriptionsPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscription Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<any | null>(null);
  const [plan, setPlan] = useState<"trial" | "monthly" | "yearly">("monthly");
  const [customValidUntil, setCustomValidUntil] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchBusinesses = async () => {
    try {
      const res = await getAllRestaurantsAction();
      if (res.success && res.restaurants) {
        setBusinesses(res.restaurants);
      }
    } catch (err) {
      console.error("Fetch subscriptions error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleOpenModal = (biz: any) => {
    setSelectedBiz(biz);
    setPlan(biz.subscription?.plan || "monthly");
    setIsModalOpen(true);
  };

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBiz?._id) return;

    setIsSaving(true);
    try {
      const res = await updateSubscriptionAction(selectedBiz._id, {
        plan,
        customValidUntil: customValidUntil || undefined,
      });

      if (res.success) {
        await fetchBusinesses();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Update subscription error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Subscription & Billing Override Console
          </h1>
          <p className="text-xs text-slate-400">
            Manual plan status management, trial extensions & valid-until date overrides
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchBusinesses}
          leftIcon={<RefreshCw size={14} />}
          className="border-slate-800 text-slate-300 hover:bg-slate-900"
        >
          Refresh Billing Data
        </Button>
      </div>

      {/* Subscription Table */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
          <span>Registered SaaS Subscriptions ({businesses.length})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="pb-3">Business Name</th>
                <th className="pb-3">Current Plan</th>
                <th className="pb-3">Billing Cycle</th>
                <th className="pb-3">Valid Until / Trial Ends</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {businesses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                businesses.map((b) => {
                  const sub = b.subscription || {};
                  const validDate = sub.paidUntil || sub.trialEndsAt;

                  return (
                    <tr key={b._id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3.5 font-semibold text-white">
                        <div>
                          <span>{b.name}</span>
                          <p className="text-[11px] font-mono text-slate-500">/{b.slug}</p>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <Badge
                          variant={sub.plan === "trial" ? "warning" : "success"}
                          size="sm"
                        >
                          {sub.plan?.toUpperCase() || "TRIAL"}
                        </Badge>
                      </td>
                      <td className="py-3.5 uppercase font-bold text-slate-400">
                        {sub.billingCycle || "MANUAL"}
                      </td>
                      <td className="py-3.5 text-slate-300">
                        {validDate ? new Date(validDate).toLocaleDateString() : "Lifetime / Active"}
                      </td>
                      <td className="py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(b)}
                          className="border-slate-700 text-slate-200 hover:bg-slate-800"
                        >
                          Override Plan →
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Override Subscription Plan"
        maxWidth="sm"
      >
        <form onSubmit={handleUpdateSubscription} className="space-y-4">
          <p className="text-xs text-slate-500">
            Updating plan for <span className="font-bold">{selectedBiz?.name}</span>.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Select Subscription Plan *
            </label>
            <select
              value={plan}
              onChange={(e: any) => setPlan(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            >
              <option value="trial">14-Day Free Trial</option>
              <option value="monthly">Monthly Paid Plan (₹499/mo)</option>
              <option value="yearly">Yearly Paid Plan (₹4,999/yr)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Custom Expiration Date (Optional)
            </label>
            <input
              type="date"
              value={customValidUntil}
              onChange={(e) => setCustomValidUntil(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" isLoading={isSaving}>
              Save Subscription Override
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
