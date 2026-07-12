"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Driver {
  id: string;
  profile_id?: string | null;
  employee_code: string;
  full_name: string;
  contact_number?: string | null;
  license_number: string;
  license_category: string;
  license_expiry: string; // YYYY-MM-DD
  joining_date?: string | null;
  safety_score: number;
  status: "available" | "on_trip" | "off_duty" | "suspended";
}

interface DriverTableProps {
  initialDrivers: Driver[];
}

export function DriverTable({ initialDrivers }: DriverTableProps) {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Deletion modals
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local client filters
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.full_name.toLowerCase().includes(search.toLowerCase()) ||
      d.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      d.license_number.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "" || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/drivers/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete driver");
      }

      setDrivers(drivers.filter((d) => d.id !== deleteId));
      setDeleteId(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  // Check expiration warning thresholds
  const getLicenseWarning = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: "EXPIRED", color: "bg-red-100 text-red-700 border-red-200" };
    } else if (diffDays <= 30) {
      return { label: `${diffDays} DAYS LEFT`, color: "bg-amber-100 text-amber-700 border-amber-200" };
    }
    return null;
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
              placeholder="Search driver name, ID, or license..."
              className="w-full bg-[#f3f2ff] border border-[#c3c5d9] rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#c3c5d9] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] outline-none"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="off_duty">Off Duty</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <Link
          href="/drivers/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0052ff] text-white rounded-lg text-sm font-semibold hover:bg-[#003ec7] transition-all whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Onboard Driver
        </Link>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
          {error}
        </div>
      )}

      {/* Drivers List Card */}
      <div className="bg-white border border-[#e1e1ef] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {filteredDrivers.length === 0 ? (
            <div className="p-12 text-center text-[#505f76] text-sm">
              No drivers found. Onboard a new operator to get started.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f2ff] border-b border-[#e1e1ef]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Driver Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Employee Code</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">License info</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">License Expiry</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Safety Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e1ef]">
                {filteredDrivers.map((driver) => {
                  let statusBg = "bg-gray-100 text-gray-700";
                  if (driver.status === "available") {
                    statusBg = "bg-green-100 text-green-700";
                  } else if (driver.status === "on_trip") {
                    statusBg = "bg-blue-100 text-blue-700";
                  } else if (driver.status === "off_duty") {
                    statusBg = "bg-amber-100 text-amber-700";
                  } else if (driver.status === "suspended") {
                    statusBg = "bg-red-100 text-red-700";
                  }

                  // Safety score color code
                  let scoreColor = "text-green-600 bg-green-50 border-green-200";
                  if (driver.safety_score < 75) {
                    scoreColor = "text-red-600 bg-red-50 border-red-200";
                  } else if (driver.safety_score < 90) {
                    scoreColor = "text-amber-600 bg-amber-50 border-amber-200";
                  }

                  const warning = getLicenseWarning(driver.license_expiry);

                  return (
                    <tr key={driver.id} className="hover:bg-[#0052ff]/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-[#191b25]">
                          {driver.full_name}
                        </div>
                        {driver.contact_number && (
                          <div className="text-xs text-[#505f76]">{driver.contact_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold bg-gray-100 border border-gray-200 text-[#434656] px-2 py-0.5 rounded uppercase font-mono">
                          {driver.employee_code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#191b25]">{driver.license_number}</div>
                        <div className="text-xs text-[#505f76]">Class: {driver.license_category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#191b25]">
                          {new Date(driver.license_expiry).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        {warning && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${warning.color}`}>
                            {warning.label}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold border ${scoreColor}`}>
                          {driver.safety_score} / 100
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${statusBg}`}>
                          {driver.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/drivers/${driver.id}/edit`}
                            className="p-1 text-[#505f76] hover:text-[#0052ff] rounded transition-colors"
                            title="Edit profile"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </Link>
                          <button
                            onClick={() => setDeleteId(driver.id)}
                            className="p-1 text-[#505f76] hover:text-red-600 rounded transition-colors cursor-pointer"
                            title="Offload driver"
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

      {/* Delete Confirmation Alert Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#e1e1ef] space-y-4">
            <h3 className="text-lg font-bold text-[#191b25]">Offboard Fleet Driver</h3>
            <p className="text-sm text-[#505f76]">
              Are you sure you want to delete this driver's record? This action will permanently remove their safety scoring profile, contact registry, and licensing details from the platform database.
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
                {deleting ? "De-registering..." : "Offboard"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
