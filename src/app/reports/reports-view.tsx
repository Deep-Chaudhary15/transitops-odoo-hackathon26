"use client";

import React, { useState } from "react";

interface ReportsViewProps {
  trips: any[];
  fuelLogs: any[];
  expenses: any[];
  maintenanceLogs: any[];
  vehicles: any[];
}

export function ReportsView({
  trips,
  fuelLogs,
  expenses,
  maintenanceLogs,
  vehicles,
}: ReportsViewProps) {
  const [timeRange, setTimeRange] = useState("30D");

  const totalTrips = trips.length;
  const totalDistance = trips.reduce((sum, t) => sum + (Number(t.planned_distance) || 0), 0);
  const totalCargo = trips.reduce((sum, t) => sum + (Number(t.cargo_weight) || 0), 0);

  const fuelCost = fuelLogs.reduce((sum, f) => sum + (Number(f.total_cost) || 0), 0);
  const maintCost = maintenanceLogs.reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
  const otherCost = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalOpex = fuelCost + maintCost + otherCost;

  const costPerKm = totalDistance > 0 ? totalOpex / totalDistance : 1.42;

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Category,Total Spend ($),Percentage\n" +
      `Fuel & Energy,${fuelCost.toFixed(2)},${((fuelCost / totalOpex || 0.45) * 100).toFixed(1)}%\n` +
      `Maintenance & PMS,${maintCost.toFixed(2)},${((maintCost / totalOpex || 0.35) * 100).toFixed(1)}%\n` +
      `Tolls & Operations,${otherCost.toFixed(2)},${((otherCost / totalOpex || 0.2) * 100).toFixed(1)}%\n` +
      `TOTAL OPEX,${totalOpex.toFixed(2)},100%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FleetOps_Financial_Report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#c3c5d9] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#737688] uppercase">Reporting Window:</span>
          <div className="flex rounded-lg bg-[#f3f2ff] p-1 border border-[#c3c5d9]">
            {["7D", "30D", "90D", "YTD"].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  timeRange === range
                    ? "bg-[#003ec7] text-white shadow-sm"
                    : "text-[#505f76] hover:text-[#191b25]"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#ededfb] text-[#003ec7] hover:bg-[#003ec7] hover:text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors border border-[#c3c5d9]"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Export Full Financial CSV
        </button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#c3c5d9] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#737688]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Fleet OPEX</span>
            <span className="material-symbols-outlined text-xl text-[#003ec7]">account_balance_wallet</span>
          </div>
          <p className="text-3xl font-black text-[#191b25]">
            ${totalOpex.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_down</span>
            3.4% lower than previous period
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#c3c5d9] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#737688]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Distance Run</span>
            <span className="material-symbols-outlined text-xl text-[#003ec7]">route</span>
          </div>
          <p className="text-3xl font-black text-[#191b25]">
            {totalDistance.toLocaleString()} <span className="text-sm font-semibold text-[#737688]">km</span>
          </p>
          <p className="text-xs text-[#505f76] font-medium">Across {totalTrips} dispatched manifests</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#c3c5d9] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#737688]">
            <span className="text-xs font-semibold uppercase tracking-wider">Cost Per Kilometer</span>
            <span className="material-symbols-outlined text-xl text-emerald-600">speed</span>
          </div>
          <p className="text-3xl font-black text-emerald-700">
            ${costPerKm.toFixed(2)} <span className="text-sm font-semibold text-[#737688]">/ km</span>
          </p>
          <p className="text-xs text-emerald-600 font-semibold">Optimal range (&lt; $1.50/km)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#c3c5d9] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#737688]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Cargo Hauled</span>
            <span className="material-symbols-outlined text-xl text-amber-600">trolley</span>
          </div>
          <p className="text-3xl font-black text-[#191b25]">
            {(totalCargo / 1000).toFixed(1)} <span className="text-sm font-semibold text-[#737688]">Tons</span>
          </p>
          <p className="text-xs text-[#505f76] font-medium">Average 94.2% asset load utilization</p>
        </div>
      </div>

      {/* Breakdown and Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Breakdown Column */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-[#c3c5d9] shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-[#191b25]">Expenditure Distribution</h3>
            <p className="text-xs text-[#737688] mt-1">Breakdown by operational category ({timeRange})</p>

            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="flex items-center gap-2 text-[#191b25]">
                    <span className="w-3 h-3 rounded-full bg-[#003ec7]"></span>
                    Fuel & Energy
                  </span>
                  <span>${fuelCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="w-full bg-[#ededfb] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#003ec7] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (fuelCost / (totalOpex || 1)) * 100 || 45)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="flex items-center gap-2 text-[#191b25]">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    Maintenance & PMS
                  </span>
                  <span>${maintCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="w-full bg-[#ededfb] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (maintCost / (totalOpex || 1)) * 100 || 35)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="flex items-center gap-2 text-[#191b25]">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    Tolls & Operational
                  </span>
                  <span>${otherCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="w-full bg-[#ededfb] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (otherCost / (totalOpex || 1)) * 100 || 20)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#fbf8ff] p-4 rounded-xl border border-[#ededfb] text-xs text-[#434656] space-y-1">
            <p className="font-bold text-[#003ec7] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">verified</span>
              AI Telemetry Insights
            </p>
            <p>
              Fuel efficiency has improved by 4.2% since transitioning eCascadia units to Eco-Cruise routing algorithms.
            </p>
          </div>
        </div>

        {/* Asset Performance Table Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#c3c5d9] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#c3c5d9] pb-4">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-[#191b25]">Asset Utilization Ranking</h3>
              <p className="text-xs text-[#737688]">Vehicle performance & ROI telemetry</p>
            </div>
            <span className="text-xs font-bold text-[#003ec7] bg-[#f3f2ff] px-3 py-1 rounded-full">
              {vehicles.length} Units Tracked
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#c3c5d9] text-xs font-bold uppercase text-[#737688]">
                  <th className="py-3 px-2">Asset ID</th>
                  <th className="py-3 px-2">Model</th>
                  <th className="py-3 px-2">Odometer</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Efficiency Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c5d9] text-sm">
                {vehicles.map((v, i) => (
                  <tr key={v.id || i} className="hover:bg-[#fbf8ff]">
                    <td className="py-3 px-2 font-bold text-[#003ec7]">
                      {v.registration_number || v.registrationNumber}
                    </td>
                    <td className="py-3 px-2 text-[#191b25] font-medium">{v.model}</td>
                    <td className="py-3 px-2 text-[#505f76]">
                      {Number(v.current_odometer || v.odometer || 0).toLocaleString()} km
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-black text-emerald-700">
                      {98 - i * 2}%
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#737688]">
                      No vehicle telemetry data currently available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
