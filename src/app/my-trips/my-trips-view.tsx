"use client";

import React, { useState } from "react";

interface Trip {
  id: string;
  trip_number?: string;
  vehicle_id: string;
  driver_id: string;
  source: string;
  destination: string;
  cargo_weight: number;
  planned_distance: number;
  actual_distance?: number | null;
  status: string;
  planned_departure?: string | null;
  notes?: string | null;
  vehicle?: {
    registration_number?: string;
    model?: string;
  } | null;
  driver?: {
    full_name?: string;
  } | null;
}

interface MyTripsViewProps {
  initialTrips: Trip[];
}

export function MyTripsView({ initialTrips }: MyTripsViewProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setTrips(
      trips.map((t) =>
        t.id === id ? { ...t, status: newStatus.toLowerCase() } : t
      )
    );
    setStatusMessage(`Trip ${id.slice(0, 6)} updated to ${newStatus.toUpperCase()}`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const filteredTrips = trips.filter((t) => {
    const st = t.status?.toUpperCase() || "ACTIVE";
    if (activeTab === "ACTIVE") return st === "ACTIVE" || st === "IN_PROGRESS" || st === "PENDING";
    return st === "COMPLETED";
  });

  return (
    <div className="space-y-6">
      {/* Driver Telemetry Top Banner */}
      <div className="bg-gradient-to-r from-[#003ec7] to-[#1e5bff] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-2xl font-bold">
            JW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">James Wilson (EMP-1001)</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-400 text-emerald-950">
                On Duty
              </span>
            </div>
            <p className="text-sm text-blue-100 mt-1">Assigned Asset: FLT-9204 (Freightliner eCascadia 2024)</p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around">
          <div className="text-center">
            <p className="text-xs text-blue-100 uppercase font-semibold">Safety Score</p>
            <p className="text-2xl font-black text-emerald-300 mt-0.5">96 / 100</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-blue-100 uppercase font-semibold">HOS Remaining</p>
            <p className="text-2xl font-black text-white mt-0.5">8h 24m</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-blue-100 uppercase font-semibold">Completed Routes</p>
            <p className="text-2xl font-black text-amber-300 mt-0.5">142</p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span className="font-semibold text-sm">{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#c3c5d9] pb-3">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("ACTIVE")}
            className={`font-semibold text-sm pb-3 -mb-3 transition-all border-b-2 ${
              activeTab === "ACTIVE"
                ? "border-[#003ec7] text-[#003ec7]"
                : "border-transparent text-[#737688] hover:text-[#191b25]"
            }`}
          >
            Active & Pending Assignments ({trips.filter((t) => t.status?.toUpperCase() !== "COMPLETED").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={`font-semibold text-sm pb-3 -mb-3 transition-all border-b-2 ${
              activeTab === "COMPLETED"
                ? "border-[#003ec7] text-[#003ec7]"
                : "border-transparent text-[#737688] hover:text-[#191b25]"
            }`}
          >
            Past Completed Routes ({trips.filter((t) => t.status?.toUpperCase() === "COMPLETED").length})
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTrips.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-xl p-12 border border-[#c3c5d9] text-center text-[#737688]">
            <span className="material-symbols-outlined text-5xl block mb-2 text-[#c3c5d9]">
              local_shipping
            </span>
            <p className="font-semibold text-base text-[#191b25]">No routes found in this tab</p>
            <p className="text-sm">You currently have no assignments matching this filter.</p>
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const isCompleted = trip.status?.toUpperCase() === "COMPLETED";
            return (
              <div
                key={trip.id}
                className="bg-white rounded-2xl border border-[#c3c5d9] shadow-[0px_4px_16px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#003ec7] bg-[#f3f2ff] px-3 py-1 rounded-full">
                      {trip.trip_number || `TRP-${trip.id.slice(0, 6)}`}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-[#003ec7]"
                      }`}
                    >
                      {!isCompleted && (
                        <span className="w-2 h-2 rounded-full bg-[#003ec7] animate-pulse"></span>
                      )}
                      {trip.status?.toUpperCase() || "ACTIVE"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#003ec7] flex items-center justify-center font-bold text-xs">
                        A
                      </div>
                      <div>
                        <p className="text-xs text-[#737688]">Origin Source</p>
                        <p className="font-bold text-sm text-[#191b25]">{trip.source}</p>
                      </div>
                    </div>
                    <div className="ml-4 h-6 w-0.5 bg-dashed border-l-2 border-blue-200"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        B
                      </div>
                      <div>
                        <p className="text-xs text-[#737688]">Destination Point</p>
                        <p className="font-bold text-sm text-[#191b25]">{trip.destination}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 bg-[#fbf8ff] p-3.5 rounded-xl border border-[#ededfb] text-xs">
                    <div>
                      <span className="text-[#737688] block">Planned Distance</span>
                      <span className="font-bold text-[#191b25] text-sm">{trip.planned_distance} km</span>
                    </div>
                    <div>
                      <span className="text-[#737688] block">Manifest Cargo</span>
                      <span className="font-bold text-[#191b25] text-sm">{trip.cargo_weight.toLocaleString()} kg</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="pt-4 border-t border-[#c3c5d9] flex flex-wrap gap-2 justify-end">
                  {!isCompleted ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(trip.id, "IN_PROGRESS")}
                        className="px-3 py-2 bg-[#f3f2ff] text-[#003ec7] font-semibold text-xs rounded-lg hover:bg-[#ededfb] transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">near_me</span>
                        Log Checkpoint
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(trip.id, "COMPLETED")}
                        className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Mark Completed
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      Delivery Confirmed & Verified
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
