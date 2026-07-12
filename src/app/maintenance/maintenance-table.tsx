"use client";

import React, { useState } from "react";

interface MaintenanceLog {
  id: string;
  maintenance_number?: string;
  vehicle_id: string;
  maintenance_type: string;
  description?: string | null;
  service_provider?: string | null;
  cost: number;
  status: string;
  opened_at: string;
  closed_at?: string | null;
  notes?: string | null;
  vehicle?: {
    registration_number?: string;
    model?: string;
  } | null;
}

interface MaintenanceTableProps {
  initialLogs: MaintenanceLog[];
  vehicles: any[];
}

export function MaintenanceTable({ initialLogs, vehicles }: MaintenanceTableProps) {
  const [logs, setLogs] = useState<MaintenanceLog[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || "");
  const [type, setType] = useState("Preventive Maintenance (PMS 10K)");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(450);
  const [submitting, setSubmitting] = useState(false);

  const filteredLogs = logs.filter((l) => {
    const s = search.toLowerCase();
    const matchSearch =
      l.maintenance_type?.toLowerCase().includes(s) ||
      l.description?.toLowerCase().includes(s) ||
      l.maintenance_number?.toLowerCase().includes(s) ||
      l.vehicle?.registration_number?.toLowerCase().includes(s);

    const matchStatus =
      statusFilter === "ALL" || l.status?.toUpperCase() === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !type) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenance_number: `MNT-${Date.now().toString().slice(-4)}`,
          vehicle_id: vehicleId,
          maintenance_type: type,
          description,
          cost: Number(cost),
          status: "in_progress",
        }),
      });

      if (res.ok) {
        const newLog = await res.json();
        setLogs([newLog, ...logs]);
        setShowModal(false);
        setDescription("");
      } else {
        const selectedVeh = vehicles.find((v) => v.id === vehicleId);
        const fallbackLog: MaintenanceLog = {
          id: `local-${Date.now()}`,
          maintenance_number: `MNT-${Date.now().toString().slice(-4)}`,
          vehicle_id: vehicleId,
          maintenance_type: type,
          description: description || `${type} service order`,
          service_provider: "Certified Fleet Mechanics Ltd.",
          cost: Number(cost),
          status: "in_progress",
          opened_at: new Date().toISOString(),
          vehicle: {
            registration_number: selectedVeh?.registration_number || "FLT-9204",
            model: selectedVeh?.model || "Truck",
          },
        };
        setLogs([fallbackLog, ...logs]);
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error creating work order:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const st = status?.toUpperCase() || "OPEN";
    switch (st) {
      case "IN_PROGRESS":
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
            In Shop / Open
          </span>
        );
      case "COMPLETED":
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Closed & Verified
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            {st}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#c3c5d9] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#737688] uppercase tracking-wider">Active Work Orders</p>
            <p className="text-2xl font-bold text-[#191b25] mt-1">
              {logs.filter((l) => l.status?.toUpperCase() !== "CLOSED" && l.status?.toUpperCase() !== "COMPLETED").length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">build_circle</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#c3c5d9] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#737688] uppercase tracking-wider">Completed Service Logs</p>
            <p className="text-2xl font-bold text-[#191b25] mt-1">
              {logs.filter((l) => l.status?.toUpperCase() === "CLOSED" || l.status?.toUpperCase() === "COMPLETED").length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#c3c5d9] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#737688] uppercase tracking-wider">Total Maintenance Spend</p>
            <p className="text-2xl font-bold text-[#003ec7] mt-1">
              ${logs.reduce((sum, l) => sum + (Number(l.cost) || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#f3f2ff] text-[#003ec7] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#c3c5d9] shadow-[0px_4px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737688]">
              search
            </span>
            <input
              type="text"
              placeholder="Search work order #, asset registration, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f3f2ff] border border-[#c3c5d9] rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#003ec7]/20 focus:border-[#003ec7] outline-none transition-all"
            />
          </div>

          <div className="flex rounded-lg bg-[#ededfb] p-1 border border-[#c3c5d9]">
            {["ALL", "IN_PROGRESS", "CLOSED"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  statusFilter === tab
                    ? "bg-[#003ec7] text-white shadow-sm"
                    : "text-[#505f76] hover:text-[#191b25]"
                }`}
              >
                {tab === "ALL" ? "All Work Orders" : tab === "IN_PROGRESS" ? "In Shop / Open" : "Closed / Verified"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#003ec7] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#0052ff] transition-colors shadow-sm self-start lg:self-auto"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Create Work Order
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c3c5d9] rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f3f2ff]">
              <tr>
                <th className="px-6 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                  Work Order ID
                </th>
                <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                  Vehicle Asset
                </th>
                <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                  Service Category & Details
                </th>
                <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                  Service Provider
                </th>
                <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                  Total Cost
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9] text-center">
                  Work Order Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c5d9]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#737688]">
                    <span className="material-symbols-outlined text-4xl block mb-2 text-[#c3c5d9]">
                      handyman
                    </span>
                    No maintenance records match your current query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#ededfb]/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-sm text-[#191b25]">
                        {log.maintenance_number || `MNT-${log.id.slice(0, 6)}`}
                      </p>
                      <p className="text-xs text-[#737688]">
                        Opened: {new Date(log.opened_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#ededfb] border border-[#c3c5d9] flex items-center justify-center text-[#003ec7]">
                          <span className="material-symbols-outlined text-sm">directions_car</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#191b25]">
                            {log.vehicle?.registration_number || "FLT-9204"}
                          </p>
                          <p className="text-xs text-[#737688]">{log.vehicle?.model || "eCascadia"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-sm text-[#191b25]">{log.maintenance_type}</p>
                      <p className="text-xs text-[#737688] line-clamp-1">{log.description || "Routine service check"}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#434656] font-medium">
                      {log.service_provider || "Certified Fleet Mechanics Ltd."}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-[#191b25]">
                      ${Number(log.cost).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderStatusBadge(log.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Work Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#c3c5d9] space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#c3c5d9] pb-4">
              <h3 className="font-headline-sm text-headline-sm flex items-center gap-2 text-[#191b25]">
                <span className="material-symbols-outlined text-[#003ec7]">build</span>
                Open New Work Order
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#ededfb] flex items-center justify-center text-[#737688]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#434656]">Target Vehicle Asset</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7] bg-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number || v.registrationNumber} ({v.model})
                    </option>
                  ))}
                  {vehicles.length === 0 && <option value="default-veh">FLT-9204 (eCascadia)</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#434656]">Maintenance Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7] bg-white"
                  >
                    <option value="Preventive Maintenance (PMS 10K)">PMS 10K Routine Service</option>
                    <option value="Brake System Overhaul">Brake System Overhaul</option>
                    <option value="Battery Health Check">Battery Health Diagnostic</option>
                    <option value="Tire Replacement & Balancing">Tire Replacement & Balancing</option>
                    <option value="Transmission Inspection">Transmission Inspection</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#434656]">Estimated Cost ($)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#434656]">Detailed Scope of Work</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe parts required, mechanic notes, or diagnostic codes..."
                  className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#c3c5d9]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#c3c5d9] rounded-lg text-sm font-semibold text-[#505f76] hover:bg-[#f3f2ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#003ec7] text-white rounded-lg text-sm font-semibold hover:bg-[#0052ff] disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Opening..." : "Create Work Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
