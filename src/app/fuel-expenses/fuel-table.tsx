"use client";

import React, { useState } from "react";

interface FuelLog {
  id: string;
  vehicle_id: string;
  fuel_date: string;
  liters: number;
  price_per_liter: number;
  total_cost: number;
  odometer?: number | null;
  station_name?: string | null;
  notes?: string | null;
  vehicle?: {
    registration_number?: string;
    model?: string;
  } | null;
}

interface Expense {
  id: string;
  vehicle_id?: string | null;
  expense_type: string;
  amount: number;
  expense_date: string;
  description?: string | null;
  vehicle?: {
    registration_number?: string;
    model?: string;
  } | null;
}

interface FuelTableProps {
  initialFuel: FuelLog[];
  initialExpenses: Expense[];
  vehicles: any[];
}

export function FuelTable({ initialFuel, initialExpenses, vehicles }: FuelTableProps) {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(initialFuel);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [activeTab, setActiveTab] = useState<"FUEL" | "EXPENSES">("FUEL");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || "");
  const [liters, setLiters] = useState(120);
  const [pricePerLiter, setPricePerLiter] = useState(1.45);
  const [odometer, setOdometer] = useState(14250);
  const [stationName, setStationName] = useState("IndianOil Expressway Plaza");
  const [expenseType, setExpenseType] = useState("toll");
  const [amount, setAmount] = useState(65);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredFuel = fuelLogs.filter((f) => {
    const s = search.toLowerCase();
    return (
      f.station_name?.toLowerCase().includes(s) ||
      f.vehicle?.registration_number?.toLowerCase().includes(s)
    );
  });

  const filteredExpenses = expenses.filter((e) => {
    const s = search.toLowerCase();
    return (
      e.expense_type?.toLowerCase().includes(s) ||
      e.description?.toLowerCase().includes(s) ||
      e.vehicle?.registration_number?.toLowerCase().includes(s)
    );
  });

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (Number(f.total_cost) || 0), 0);
  const totalOtherCost = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalLiters = fuelLogs.reduce((sum, f) => sum + (Number(f.liters) || 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return;
    setSubmitting(true);

    try {
      if (activeTab === "FUEL") {
        const res = await fetch("/api/fuel-expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "FUEL",
            vehicle_id: vehicleId,
            fuel_date: new Date().toISOString(),
            liters: Number(liters),
            price_per_liter: Number(pricePerLiter),
            total_cost: Number(liters) * Number(pricePerLiter),
            odometer: Number(odometer),
            station_name: stationName,
          }),
        });
        if (res.ok) {
          const newLog = await res.json();
          setFuelLogs([newLog, ...fuelLogs]);
          setShowModal(false);
        } else {
          const selectedVeh = vehicles.find((v) => v.id === vehicleId);
          const fallback: FuelLog = {
            id: `local-${Date.now()}`,
            vehicle_id: vehicleId,
            fuel_date: new Date().toISOString(),
            liters: Number(liters),
            price_per_liter: Number(pricePerLiter),
            total_cost: Number(liters) * Number(pricePerLiter),
            odometer: Number(odometer),
            station_name: stationName,
            vehicle: { registration_number: selectedVeh?.registration_number || "FLT-9204" },
          };
          setFuelLogs([fallback, ...fuelLogs]);
          setShowModal(false);
        }
      } else {
        const res = await fetch("/api/fuel-expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "EXPENSE",
            vehicle_id: vehicleId,
            expense_type: expenseType,
            amount: Number(amount),
            expense_date: new Date().toISOString(),
            description: description || `${expenseType} fee`,
          }),
        });
        if (res.ok) {
          const newExp = await res.json();
          setExpenses([newExp, ...expenses]);
          setShowModal(false);
        } else {
          const selectedVeh = vehicles.find((v) => v.id === vehicleId);
          const fallback: Expense = {
            id: `local-${Date.now()}`,
            vehicle_id: vehicleId,
            expense_type: expenseType,
            amount: Number(amount),
            expense_date: new Date().toISOString(),
            description: description || `${expenseType} fee`,
            vehicle: { registration_number: selectedVeh?.registration_number || "FLT-9204" },
          };
          setExpenses([fallback, ...expenses]);
          setShowModal(false);
        }
      }
    } catch (err) {
      console.error("Error creating log:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#c3c5d9] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#737688] uppercase tracking-wider">Total Fuel Expenditure</p>
            <p className="text-2xl font-bold text-[#003ec7] mt-1">
              ${totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#f3f2ff] text-[#003ec7] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">local_gas_station</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#c3c5d9] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#737688] uppercase tracking-wider">Total Volume Dispensed</p>
            <p className="text-2xl font-bold text-[#191b25] mt-1">
              {totalLiters.toLocaleString(undefined, { maximumFractionDigits: 1 })} L
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">oil_barrel</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#c3c5d9] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#737688] uppercase tracking-wider">Other Operational Costs</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              ${totalOtherCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#c3c5d9] shadow-[0px_4px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <div className="flex rounded-lg bg-[#ededfb] p-1 border border-[#c3c5d9]">
            <button
              type="button"
              onClick={() => setActiveTab("FUEL")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "FUEL"
                  ? "bg-[#003ec7] text-white shadow-sm"
                  : "text-[#505f76] hover:text-[#191b25]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">local_gas_station</span>
              Fuel Receipts ({fuelLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("EXPENSES")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "EXPENSES"
                  ? "bg-[#003ec7] text-white shadow-sm"
                  : "text-[#505f76] hover:text-[#191b25]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">payments</span>
              Tolls & Non-Fuel ({expenses.length})
            </button>
          </div>

          <div className="relative flex-1 min-w-[260px] max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737688]">
              search
            </span>
            <input
              type="text"
              placeholder={activeTab === "FUEL" ? "Search station, registration..." : "Search expense category, notes..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f3f2ff] border border-[#c3c5d9] rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#003ec7]/20 focus:border-[#003ec7] outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#003ec7] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#0052ff] transition-colors shadow-sm self-start lg:self-auto"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {activeTab === "FUEL" ? "Record Fuel Stop" : "Record Expense"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c3c5d9] rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          {activeTab === "FUEL" ? (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f2ff]">
                <tr>
                  <th className="px-6 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                    Date & Time
                  </th>
                  <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                    Vehicle Asset
                  </th>
                  <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                    Station / Vendor
                  </th>
                  <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                    Volume (Liters)
                  </th>
                  <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                    Price / Liter
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9] text-right">
                    Total Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c5d9]">
                {filteredFuel.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#737688]">
                      No fuel logs match your current query.
                    </td>
                  </tr>
                ) : (
                  filteredFuel.map((f) => (
                    <tr key={f.id} className="hover:bg-[#ededfb]/40 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#191b25]">
                        {new Date(f.fuel_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-sm text-[#003ec7] bg-[#f3f2ff] px-2.5 py-1 rounded-md">
                          {f.vehicle?.registration_number || "FLT-9204"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-[#191b25]">
                        {f.station_name || "Expressway Plaza Station"}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[#191b25]">
                        {Number(f.liters).toFixed(1)} L
                      </td>
                      <td className="px-4 py-4 text-sm text-[#434656]">
                        ${Number(f.price_per_liter).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-[#003ec7] text-right">
                        ${Number(f.total_cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f2ff]">
                <tr>
                  <th className="px-6 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                    Date & Time
                  </th>
                  <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                    Target Asset
                  </th>
                  <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                    Expense Category
                  </th>
                  <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                    Description & Notes
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9] text-right">
                    Amount ($)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c5d9]">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#737688]">
                      No non-fuel expense records match your query.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-[#ededfb]/40 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#191b25]">
                        {new Date(e.expense_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-sm text-[#003ec7] bg-[#f3f2ff] px-2.5 py-1 rounded-md">
                          {e.vehicle?.registration_number || "FLT-9204"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 uppercase text-gray-800">
                          {e.expense_type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#434656]">
                        {e.description || "Operational expenditure"}
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-amber-600 text-right">
                        ${Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#c3c5d9] space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#c3c5d9] pb-4">
              <h3 className="font-headline-sm text-headline-sm flex items-center gap-2 text-[#191b25]">
                <span className="material-symbols-outlined text-[#003ec7]">
                  {activeTab === "FUEL" ? "local_gas_station" : "payments"}
                </span>
                {activeTab === "FUEL" ? "Record Fuel Purchase" : "Record Operational Expense"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#ededfb] flex items-center justify-center text-[#737688]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
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

              {activeTab === "FUEL" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#434656]">Volume (Liters)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={liters}
                        onChange={(e) => setLiters(Number(e.target.value))}
                        className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#434656]">Price / Liter ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricePerLiter}
                        onChange={(e) => setPricePerLiter(Number(e.target.value))}
                        className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#434656]">Current Odometer</label>
                      <input
                        type="number"
                        value={odometer}
                        onChange={(e) => setOdometer(Number(e.target.value))}
                        className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#434656]">Station / Plaza Name</label>
                      <input
                        type="text"
                        value={stationName}
                        onChange={(e) => setStationName(e.target.value)}
                        className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7]"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#434656]">Category</label>
                      <select
                        value={expenseType}
                        onChange={(e) => setExpenseType(e.target.value)}
                        className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7] bg-white"
                      >
                        <option value="toll">Highway Toll / Bridge Fee</option>
                        <option value="parking">Secure Parking & Overnight</option>
                        <option value="repairs">On-Road Emergency Repairs</option>
                        <option value="insurance">Asset Insurance / Permit</option>
                        <option value="other">Miscellaneous Operational</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#434656]">Total Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#434656]">Notes / Receipt Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Interstate 95 North Toll Plaza"
                      className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7]"
                    />
                  </div>
                </>
              )}

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
                  {submitting ? "Saving..." : "Record Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
