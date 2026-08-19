"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, QrCode, Download, Printer, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { QRPreview } from "@/components/ui/QRPreview";
import { getMyBusinessAction } from "@/app/actions/restaurant.actions";

export interface TableData {
  _id: string;
  tableNumber: string;
  label?: string;
  capacity?: number;
  qrCodeUrl?: string;
}

export default function TablesQRPage() {
  const [business, setBusiness] = useState<any | null>(null);
  const [tables, setTables] = useState<TableData[]>([
    { _id: "t1", tableNumber: "T1", label: "Window Table", capacity: 4 },
    { _id: "t2", tableNumber: "T2", label: "Main Hall", capacity: 2 },
    { _id: "t3", tableNumber: "T3", label: "Rooftop Garden", capacity: 6 },
    { _id: "t4", tableNumber: "T4", label: "VIP Booth", capacity: 4 },
  ]);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(tables[0] || null);

  // Add Table Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newCapacity, setNewCapacity] = useState("4");

  useEffect(() => {
    getMyBusinessAction().then((res) => {
      if (res.success && res.business) {
        setBusiness(res.business);
      }
    });
  }, []);

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    const newT: TableData = {
      _id: `t_${Date.now()}`,
      tableNumber: newTableNumber.trim(),
      label: newLabel.trim() || "Standard Table",
      capacity: parseInt(newCapacity) || 4,
    };

    setTables((prev) => [...prev, newT]);
    if (!selectedTable) setSelectedTable(newT);

    setNewTableNumber("");
    setNewLabel("");
    setIsModalOpen(false);
  };

  const handleDeleteTable = (tableId: string) => {
    if (!confirm("Are you sure you want to remove this table?")) return;
    setTables((prev) => prev.filter((t) => t._id !== tableId));
    if (selectedTable?._id === tableId) {
      setSelectedTable(tables.find((t) => t._id !== tableId) || null);
    }
  };

  // Base URL for QR Code
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://menugo.in";
  const qrUrl = business?.slug && selectedTable
    ? `${baseUrl}/${business.slug}?table=${selectedTable.tableNumber}`
    : `${baseUrl}/demo?table=T1`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
            Table & QR Code Asset Generator
          </h1>
          <p className="text-xs text-slate-500">
            Register tables and download print-ready SVG/PNG QR code cards for your tables
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus size={14} />}
        >
          Register New Table
        </Button>
      </div>

      {/* Main Grid: Tables Grid (Left) + Selected QR Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Registered Tables Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
              <QrCode size={16} className="text-indigo-600" /> Registered Tables ({tables.length})
            </h2>
            <span className="text-xs text-slate-400">Click a table to preview & download QR</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tables.map((t) => {
              const isSelected = selectedTable?._id === t._id;
              return (
                <div
                  key={t._id}
                  onClick={() => setSelectedTable(t)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 relative group ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-slate-900 font-heading">
                        {t.tableNumber}
                      </span>
                      <p className="text-[11px] text-slate-500 font-semibold truncate">
                        {t.label}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>{t.capacity} Seats</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTable(t._id);
                      }}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                      title="Delete Table"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: QR Preview Card */}
        <div className="space-y-4">
          {selectedTable ? (
            <QRPreview
              url={qrUrl}
              tableNumber={selectedTable.tableNumber}
              businessName={business?.name || "MenuGO Establishment"}
              size={180}
            />
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              Select a table to preview QR code.
            </div>
          )}
        </div>
      </div>

      {/* Add Table Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Dine-In Table"
        maxWidth="sm"
      >
        <form onSubmit={handleAddTable} className="space-y-4">
          <Input
            label="Table Number / Identifier *"
            placeholder="e.g. T5 or Room 102"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            required
          />

          <Input
            label="Table Label / Location"
            placeholder="e.g. Patio, Outdoor, Window Seat"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />

          <Input
            label="Seating Capacity"
            type="number"
            placeholder="4"
            value={newCapacity}
            onChange={(e) => setNewCapacity(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Save Table
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
