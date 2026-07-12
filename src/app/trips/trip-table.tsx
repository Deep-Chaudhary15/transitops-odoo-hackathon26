"use client";

import React, { useState } from "react";
import Link from "next/link";

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
  created_at: string;
  vehicle?: {
    registration_number?: string;
    model?: string;
    vehicle_type?: string;
  } | null;
  driver?: {
    full_name?: string;
    contact_number?: string;
  } | null;
}

interface TripTableProps {
  initialTrips: Trip[];
  vehicles: any[];
  drivers: any[];
}

export function TripTable({ initialTrips, vehicles, drivers }: TripTableProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);

  // New trip form state
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || "");
  const [driverId, setDriverId] = useState(drivers[0]?.id || "");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [cargoWeight, setCargoWeight] = useState(5000);
  const [plannedDistance, setPlannedDistance] = useState(150);
  const [submitting, setSubmitting] = useState(false);

  const filteredTrips = trips.filter((t) => {
    const s = search.toLowerCase();
    const matchSearch =
      t.source?.toLowerCase().includes(s) ||
      t.destination?.toLowerCase().includes(s) ||
      t.trip_number?.toLowerCase().includes(s) ||
      t.vehicle?.registration_number?.toLowerCase().includes(s) ||
      t.driver?.full_name?.toLowerCase().includes(s);

    const matchStatus =
      statusFilter === "ALL" || t.status?.toUpperCase() === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !driverId || !source || !destination) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_number: `TRP-${Date.now().toString().slice(-4)}`,
          vehicle_id: vehicleId,
          driver_id: driverId,
          source,
          destination,
          cargo_weight: Number(cargoWeight),
          planned_distance: Number(plannedDistance),
          status: "active",
        }),
      });

      if (res.ok) {
        const newTrip = await res.json();
        setTrips([newTrip, ...trips]);
        setShowModal(false);
        setSource("");
        setDestination("");
      } else {
        // Local state addition if API fails
        const selectedVeh = vehicles.find((v) => v.id === vehicleId);
        const selectedDri = drivers.find((d) => d.id === driverId);
        const fallbackTrip: Trip = {
          id: `local-${Date.now()}`,
          trip_number: `TRP-${Date.now().toString().slice(-4)}`,
          vehicle_id: vehicleId,
          driver_id: driverId,
          source,
          destination,
          cargo_weight: Number(cargoWeight),
          planned_distance: Number(plannedDistance),
          status: "active",
          created_at: new Date().toISOString(),
          vehicle: {
            registration_number: selectedVeh?.registration_number || "FLT-NEW",
            model: selectedVeh?.model || "Truck",
          },
          driver: {
            full_name: selectedDri?.full_name || "Assigned Driver",
          },
        };
        setTrips([fallbackTrip, ...trips]);
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error dispatching trip:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const st = status?.toUpperCase() || "PENDING";
    switch (st) {
      case "ACTIVE":
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d3e4fe] text-[#003ec7] border border-[#b7c4ff]">
            <span className="w-2 h-2 rounded-full bg-[#003ec7] animate-pulse"></span>
            En Route / Active
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Completed
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Pending
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
      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#c3c5d9] shadow-[0px_4px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737688]">
              search
            </span>
            <input
              type="text"
              placeholder="Search source, destination, trip #, driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f3f2ff] border border-[#c3c5d9] rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#003ec7]/20 focus:border-[#003ec7] outline-none transition-all"
            />
          </div>

          <div className="flex rounded-lg bg-[#ededfb] p-1 border border-[#c3c5d9]">
            {["ALL", "ACTIVE", "PENDING", "COMPLETED"].map((tab) => (
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
                {tab === "ALL" ? "All Trips" : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#003ec7] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#0052ff] transition-colors shadow-sm self-start lg:self-auto"
        >
          <span className="material-symbols-outlined text-sm">add_road</span>
          Dispatch New Trip
        </button>
      </div>

      {/* Trips Table */}
      <div className="bg-white border border-[#c3c5d9] rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f3f2ff]">
              <tr>
                <th className="px-6 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                  Trip Manifest
                </th>
                <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                  Route Corridor
                </th>
                <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                  Assigned Asset
                </th>
                <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                  Assigned Operator
                </th>
                <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">
                  Metrics & Load
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9] text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c5d9]">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#737688]">
                    <span className="material-symbols-outlined text-4xl block mb-2 text-[#c3c5d9]">
                      route
                    </span>
                    No trips match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-[#ededfb]/40 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/trips/${trip.id}`}
                        className="font-semibold text-sm text-[#003ec7] hover:text-[#0052ff] hover:underline cursor-pointer"
                      >
                        {trip.trip_number || `TRP-${trip.id.slice(0, 6)}`}
                      </Link>
                      <p className="text-xs text-[#737688]">
                        Dispatched: {trip.planned_departure ? new Date(trip.planned_departure).toLocaleDateString() : "Recent"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-[#191b25]">{trip.source}</span>
                        <span className="material-symbols-outlined text-xs text-[#003ec7]">arrow_forward</span>
                        <span className="font-medium text-[#191b25]">{trip.destination}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#ededfb] border border-[#c3c5d9] flex items-center justify-center text-[#003ec7]">
                          <span className="material-symbols-outlined text-sm">local_shipping</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#191b25]">
                            {trip.vehicle?.registration_number || "FLT-ASSET"}
                          </p>
                          <p className="text-xs text-[#737688]">{trip.vehicle?.model || "Truck"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#d3e4fe] flex items-center justify-center font-bold text-[#003ec7] text-xs">
                          {trip.driver?.full_name?.slice(0, 2).toUpperCase() || "DR"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#191b25]">
                            {trip.driver?.full_name || "Unassigned"}
                          </p>
                          <p className="text-xs text-[#737688]">
                            {trip.driver?.contact_number || "+1 (555) Fleet"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <p className="font-medium text-[#191b25]">{trip.planned_distance} km</p>
                      <p className="text-xs text-[#737688]">{trip.cargo_weight.toLocaleString()} kg cargo</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderStatusBadge(trip.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#c3c5d9] space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#c3c5d9] pb-4">
              <h3 className="font-headline-sm text-headline-sm flex items-center gap-2 text-[#191b25]">
                <span className="material-symbols-outlined text-[#003ec7]">add_road</span>
                Dispatch New Route
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#ededfb] flex items-center justify-center text-[#737688]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#434656]">Source Origin</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmedabad, GJ"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#434656]">Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surat, GJ"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7] focus:ring-1 focus:ring-[#003ec7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#434656]">Assign Vehicle Asset</label>
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
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#434656]">Assign Operator</label>
                  <select
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7] bg-white"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name || d.name}
                      </option>
                    ))}
                    {drivers.length === 0 && <option value="default-dri">James Wilson</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#434656]">Planned Distance (km)</label>
                  <input
                    type="number"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(Number(e.target.value))}
                    className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#434656]">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(Number(e.target.value))}
                    className="w-full border border-[#c3c5d9] rounded-lg p-2.5 text-sm outline-none focus:border-[#003ec7]"
                  />
                </div>
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
                  {submitting ? "Dispatching..." : "Confirm & Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
