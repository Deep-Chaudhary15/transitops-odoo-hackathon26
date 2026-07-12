"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VehicleStatus, VehicleType } from "@prisma/client";

interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  capacityKg: number;
  odometer: number;
  acquisitionCost: number;
  region: string | null;
  status: VehicleStatus;
}

interface VehicleTableProps {
  initialVehicles: Vehicle[];
  distinctRegions: string[];
}

export function VehicleTable({ initialVehicles, distinctRegions }: VehicleTableProps) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  
  // Local Filter States
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Delete Modal States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply filters locally on the client for instant speed
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase());
      
    const matchesRegion = regionFilter === "" || v.region === regionFilter;
    const matchesType = typeFilter === "" || v.type === typeFilter;
    const matchesStatus = statusFilter === "" || v.status === statusFilter;

    return matchesSearch && matchesRegion && matchesType && matchesStatus;
  });

  // Handle Delete Action
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/vehicles/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete vehicle");
      }

      // Evict from local list
      setVehicles(vehicles.filter((v) => v.id !== deleteId));
      setDeleteId(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#e1e1ef]">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737688]" style={{ fontSize: "20px" }}>
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search registration, make, model..."
              className="w-full bg-[#f3f2ff] border border-[#c3c5d9] rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] outline-none transition-all"
            />
          </div>

          {/* Region Filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-white border border-[#c3c5d9] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] outline-none"
          >
            <option value="">All Regions</option>
            {distinctRegions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-[#c3c5d9] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] outline-none"
          >
            <option value="">All Types</option>
            {Object.values(VehicleType).map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#c3c5d9] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] outline-none"
          >
            <option value="">All Statuses</option>
            {Object.values(VehicleStatus).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <Link
          href="/vehicles/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0052ff] text-white rounded-lg text-sm font-semibold hover:bg-[#003ec7] transition-all whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Register Asset
        </Link>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
          {error}
        </div>
      )}

      {/* Vehicles Table Card */}
      <div className="bg-white border border-[#e1e1ef] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {filteredVehicles.length === 0 ? (
            <div className="p-12 text-center text-[#505f76] text-sm">
              No vehicles matching filters. Register a new asset to get started.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f2ff] border-b border-[#e1e1ef]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Plate Number</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Specifications</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Type &amp; Region</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Odometer</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Acquisition Cost</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e1ef]">
                {filteredVehicles.map((vehicle) => {
                  let statusBg = "bg-gray-100 text-gray-700";
                  if (vehicle.status === VehicleStatus.AVAILABLE) {
                    statusBg = "bg-green-100 text-green-700";
                  } else if (vehicle.status === VehicleStatus.ON_TRIP) {
                    statusBg = "bg-blue-100 text-blue-700";
                  } else if (vehicle.status === VehicleStatus.IN_SHOP) {
                    statusBg = "bg-amber-100 text-amber-700";
                  } else if (vehicle.status === VehicleStatus.DECOMMISSIONED) {
                    statusBg = "bg-red-100 text-red-700";
                  }

                  return (
                    <tr key={vehicle.id} className="hover:bg-[#0052ff]/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-[#191b25] tracking-wide block uppercase">
                          {vehicle.registrationNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-[#191b25]">
                          {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-xs text-[#505f76]">Year: {vehicle.year}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#191b25] capitalize">
                          {vehicle.type.replace("_", " ").toLowerCase()}
                        </div>
                        <div className="text-xs text-[#505f76]">Region: {vehicle.region || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#191b25]">
                        {vehicle.capacityKg.toLocaleString()} kg
                      </td>
                      <td className="px-6 py-4 text-sm text-[#505f76]">
                        {vehicle.odometer.toLocaleString()} km
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#191b25]">
                        ₹{vehicle.acquisitionCost.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusBg}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/vehicles/${vehicle.id}/edit`}
                            className="p-1 text-[#505f76] hover:text-[#0052ff] rounded transition-colors"
                            title="Edit specs"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </Link>
                          <button
                            onClick={() => setDeleteId(vehicle.id)}
                            className="p-1 text-[#505f76] hover:text-red-600 rounded transition-colors cursor-pointer"
                            title="De-register asset"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#e1e1ef] space-y-4">
            <h3 className="text-lg font-bold text-[#191b25]">De-register Fleet Asset</h3>
            <p className="text-sm text-[#505f76]">
              Are you sure you want to delete this vehicle? This action will permanently erase its telemetry data, fuel records, and history from the server.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={deleting}
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-[#c3c5d9] hover:bg-gray-50 text-sm font-semibold rounded-lg text-[#191b25] transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-sm font-semibold rounded-lg text-white transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? "De-registering..." : "De-register"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
