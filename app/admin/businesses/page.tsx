"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Key,
  Trash2,
  Power,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  getAllRestaurantsAction,
  toggleRestaurantStatusAction,
  deleteRestaurantAction,
  resetRestaurantCredentialsAction,
} from "@/app/actions/admin.actions";

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Credential Modal State
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [selectedBizForCred, setSelectedBizForCred] = useState<any | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [credError, setCredError] = useState<string | null>(null);
  const [credSuccess, setCredSuccess] = useState(false);

  const fetchBusinesses = async () => {
    try {
      const res = await getAllRestaurantsAction();
      if (res.success && res.restaurants) {
        setBusinesses(res.restaurants);
      }
    } catch (err) {
      console.error("Fetch businesses error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleToggleSuspend = async (bizId: string, isSuspended: boolean) => {
    const nextSuspendState = !isSuspended;
    setBusinesses((prev) =>
      prev.map((b) => (b._id === bizId ? { ...b, isSuspended: nextSuspendState } : b))
    );

    try {
      await toggleRestaurantStatusAction(bizId, nextSuspendState);
    } catch (err) {
      console.error("Toggle status error:", err);
      fetchBusinesses();
    }
  };

  const handleDeleteBusiness = async (biz: any) => {
    const confirmName = prompt(
      `DANGER ZONE: Type "${biz.name}" to permanently delete this business and all its menu items & orders:`
    );

    if (confirmName !== biz.name) {
      alert("Business name did not match. Deletion cancelled.");
      return;
    }

    try {
      await deleteRestaurantAction(biz._id);
      setBusinesses((prev) => prev.filter((b) => b._id !== biz._id));
      alert("Business deleted permanently.");
    } catch (err) {
      console.error("Delete business error:", err);
    }
  };

  const handleResetCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizForCred?._id) return;

    setCredError(null);
    setCredSuccess(false);

    try {
      const res = await resetRestaurantCredentialsAction(selectedBizForCred._id, {
        email: newEmail || undefined,
        password: newPassword || undefined,
      });

      if (res.error) {
        setCredError(res.error);
      } else {
        setCredSuccess(true);
        setTimeout(() => {
          setIsCredModalOpen(false);
          setCredSuccess(false);
          setNewEmail("");
          setNewPassword("");
        }, 1500);
      }
    } catch (err) {
      setCredError("Failed to reset credentials.");
    }
  };

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.ownerId?.email && b.ownerId.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlan = planFilter === "all" ? true : b.subscription?.plan === planFilter;

    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Registered Businesses Directory
          </h1>
          <p className="text-xs text-slate-400">
            View, search, suspend access, reset passwords & manage platform tenants
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by business name, slug or owner email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-4 py-2 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
        >
          <option value="all">All Subscription Plans</option>
          <option value="trial">Trial Plan</option>
          <option value="monthly">Monthly Plan</option>
          <option value="yearly">Yearly Plan</option>
        </select>
      </div>

      {/* Businesses Table */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
          <span>Showing {filteredBusinesses.length} registered accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="pb-3">Business Name & Slug</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Owner Email</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No businesses found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 font-semibold text-white">
                      <div>
                        <span>{b.name}</span>
                        <p className="text-[11px] font-mono text-slate-500">/{b.slug}</p>
                      </div>
                    </td>
                    <td className="py-3.5 uppercase font-bold text-slate-400">
                      {b.type || "RESTAURANT"}
                    </td>
                    <td className="py-3.5 text-slate-300">{b.ownerId?.email || "N/A"}</td>
                    <td className="py-3.5">
                      <Badge
                        variant={b.subscription?.plan === "trial" ? "warning" : "success"}
                        size="sm"
                      >
                        {b.subscription?.plan?.toUpperCase() || "TRIAL"}
                      </Badge>
                    </td>
                    <td className="py-3.5">
                      <Badge variant={b.isSuspended ? "danger" : "success"} size="sm">
                        {b.isSuspended ? "SUSPENDED" : "ACTIVE"}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Suspend */}
                        <button
                          onClick={() => handleToggleSuspend(b._id, b.isSuspended)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            b.isSuspended
                              ? "border-emerald-700 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900"
                              : "border-amber-700 bg-amber-950/60 text-amber-300 hover:bg-amber-900"
                          }`}
                          title={b.isSuspended ? "Activate Account" : "Suspend Account"}
                        >
                          <Power size={14} />
                        </button>

                        {/* Reset Credentials */}
                        <button
                          onClick={() => {
                            setSelectedBizForCred(b);
                            setNewEmail(b.ownerId?.email || "");
                            setIsCredModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors"
                          title="Reset Credentials"
                        >
                          <Key size={14} />
                        </button>

                        {/* Delete Business */}
                        <button
                          onClick={() => handleDeleteBusiness(b)}
                          className="p-1.5 rounded-lg border border-rose-950 bg-rose-950/40 text-rose-400 hover:bg-rose-900 transition-colors"
                          title="Delete Business"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Credentials Modal */}
      <Modal
        isOpen={isCredModalOpen}
        onClose={() => setIsCredModalOpen(false)}
        title="Reset Business Owner Credentials"
        maxWidth="sm"
      >
        <form onSubmit={handleResetCredentials} className="space-y-4">
          <p className="text-xs text-slate-500">
            Reset credentials for <span className="font-bold">{selectedBizForCred?.name}</span>.
          </p>

          {credSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Credentials updated!
            </div>
          )}

          {credError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
              ⚠️ {credError}
            </div>
          )}

          <Input
            label="Owner Email Address"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />

          <Input
            label="New Password (min 8 chars)"
            type="password"
            placeholder="Set new password..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsCredModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Save New Credentials
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
