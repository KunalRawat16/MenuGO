"use client";

import React, { useState } from "react";
import { Users, Plus, ShieldCheck, Mail, CheckCircle2, UserPlus, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "kitchen" | "waiter" | "manager";
  status: "active" | "invited";
  permissions: string[];
}

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: "s1",
      name: "Chef Ramesh Kumar",
      email: "ramesh@kitchen.com",
      role: "kitchen",
      status: "active",
      permissions: ["View Orders", "Update Preparation Status"],
    },
    {
      id: "s2",
      name: "Anil Sharma",
      email: "anil@waiter.com",
      role: "waiter",
      status: "active",
      permissions: ["View Orders", "Mark Served & Completed"],
    },
    {
      id: "s3",
      name: "Priya Singh",
      email: "priya@manager.com",
      role: "manager",
      status: "invited",
      permissions: ["View Orders", "Edit Menu Items", "Manage Tables"],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"kitchen" | "waiter" | "manager">("kitchen");

  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const newStaff: StaffMember = {
      id: `s_${Date.now()}`,
      name: name.trim() || email.split("@")[0],
      email: email.trim(),
      role,
      status: "invited",
      permissions:
        role === "kitchen"
          ? ["View Orders", "Update Preparation Status"]
          : role === "waiter"
          ? ["View Orders", "Mark Served"]
          : ["View Orders", "Edit Menu"],
    };

    setStaffList((prev) => [...prev, newStaff]);
    setName("");
    setEmail("");
    setIsModalOpen(false);
    alert(`Invitation sent to ${newStaff.email}! (UI Placeholder)`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
            Staff Sub-Accounts & Permission Control
          </h1>
          <p className="text-xs text-slate-500">
            Invite kitchen staff, waiters, and managers with restricted access permissions
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<UserPlus size={14} />}
        >
          Invite Staff Member
        </Button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
            <Users size={16} className="text-indigo-600" /> Active Sub-Accounts ({staffList.length})
          </h2>
          <span className="text-xs text-slate-400">UI Placeholder module</span>
        </div>

        <div className="divide-y divide-slate-100">
          {staffList.map((member) => (
            <div
              key={member.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{member.name}</span>
                    <Badge
                      variant={member.status === "active" ? "success" : "warning"}
                      size="sm"
                    >
                      {member.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-left sm:text-right">
                  <Badge variant="default" size="md">
                    Role: {member.role.toUpperCase()}
                  </Badge>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {member.permissions.join(" • ")}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setStaffList((prev) => prev.filter((s) => s.id !== member.id))
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invite Staff Sub-Account"
        maxWidth="sm"
      >
        <form onSubmit={handleInviteStaff} className="space-y-4">
          <Input
            label="Staff Name"
            placeholder="Ramesh Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Staff Email Address *"
            type="email"
            placeholder="staff@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Assigned Role & Permissions *
            </label>
            <select
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              <option value="kitchen">🍳 Kitchen Staff (View & update cooking queue)</option>
              <option value="waiter">🧑‍🍳 Waiter / Runner (Mark served & collect payment)</option>
              <option value="manager">💼 Shift Manager (Edit menu & view analytics)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Send Invite Link
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
