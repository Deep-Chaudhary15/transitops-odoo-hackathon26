"use client";

import React, { useState } from "react";

type PermissionStatus = "full" | "read" | "none";

interface RBACRow {
  id: string;
  module: string;
  subtitle: string;
  permissions: {
    fleetManager: PermissionStatus;
    dispatcher: PermissionStatus;
    safetyOfficer: PermissionStatus;
    financialAnalyst: PermissionStatus;
  };
}

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("FleetOps Enterprise Logistics LLC");
  const [taxId, setTaxId] = useState("US-993-221-0045");
  const [supportEmail, setSupportEmail] = useState("admin@fleetops.logistics");

  const [notifyMaintenance, setNotifyMaintenance] = useState(true);
  const [notifyFuel, setNotifyFuel] = useState(false);
  const [notifySchedule, setNotifySchedule] = useState(true);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const [rbacData, setRbacData] = useState<RBACRow[]>([
    {
      id: "vehicles",
      module: "Vehicles & Assets",
      subtitle: "FULL LIFECYCLE MANAGEMENT",
      permissions: {
        fleetManager: "full",
        dispatcher: "read",
        safetyOfficer: "read",
        financialAnalyst: "none",
      },
    },
    {
      id: "drivers",
      module: "Drivers & Compliance",
      subtitle: "HOS, ELD LOGS, MEDICALS",
      permissions: {
        fleetManager: "full",
        dispatcher: "full",
        safetyOfficer: "full",
        financialAnalyst: "read",
      },
    },
    {
      id: "trips",
      module: "Trip Dispatch & Routing",
      subtitle: "ASSIGNMENT & REAL-TIME TRACKING",
      permissions: {
        fleetManager: "full",
        dispatcher: "full",
        safetyOfficer: "read",
        financialAnalyst: "read",
      },
    },
    {
      id: "maintenance",
      module: "Maintenance Schedules",
      subtitle: "PMS, DVIRS, WORK ORDERS",
      permissions: {
        fleetManager: "full",
        dispatcher: "read", // In user table icon is edit (which is full/edit)
        safetyOfficer: "full",
        financialAnalyst: "none",
      },
    },
    {
      id: "expenses",
      module: "Expenses & Revenue",
      subtitle: "FUEL CARDS, IFTA, P&L",
      permissions: {
        fleetManager: "read",
        dispatcher: "none",
        safetyOfficer: "none",
        financialAnalyst: "full",
      },
    },
    {
      id: "system",
      module: "System Configuration",
      subtitle: "INTEGRATIONS, APIS, BILLING",
      permissions: {
        fleetManager: "full",
        dispatcher: "none",
        safetyOfficer: "none",
        financialAnalyst: "read",
      },
    },
  ]);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDiscard = () => {
    setCompanyName("FleetOps Enterprise Logistics LLC");
    setTaxId("US-993-221-0045");
    setSupportEmail("admin@fleetops.logistics");
    setNotifyMaintenance(true);
    setNotifyFuel(false);
    setNotifySchedule(true);
  };

  const togglePermission = (rowId: string, roleKey: keyof RBACRow["permissions"]) => {
    setRbacData((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const current = row.permissions[roleKey];
        const next: PermissionStatus =
          current === "full" ? "read" : current === "read" ? "none" : "full";
        return {
          ...row,
          permissions: {
            ...row.permissions,
            [roleKey]: next,
          },
        };
      })
    );
  };

  const renderPermissionIcon = (status: PermissionStatus, customIcon?: string) => {
    if (status === "full") {
      return (
        <span
          className="material-symbols-outlined text-[#003ec7] cursor-pointer hover:scale-110 transition-transform select-none"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {customIcon || "check_circle"}
        </span>
      );
    }
    if (status === "read") {
      return (
        <span className="material-symbols-outlined text-[#737688] cursor-pointer hover:scale-110 transition-transform select-none">
          {customIcon || "visibility"}
        </span>
      );
    }
    return (
      <span className="material-symbols-outlined text-[#c3c5d9] cursor-pointer hover:scale-110 transition-transform select-none">
        do_not_disturb_on
      </span>
    );
  };

  return (
    <div className="p-[24px] max-w-[1440px] mx-auto w-full space-y-[24px]">
      {/* Toast Notification */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#191b25] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 border border-[#434656]">
          <span className="material-symbols-outlined text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <div>
            <p className="font-semibold text-sm">Configuration Saved</p>
            <p className="text-xs text-[#c3c5d9]">All system settings and role permissions have been updated.</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-end justify-between border-b border-[#c3c5d9] pb-[16px]">
        <div>
          <h2 className="font-display-lg text-display-lg text-[#191b25]">Configuration</h2>
          <p className="font-body-md text-body-md text-[#434656]">
            Manage organization settings, security roles, and system-wide preferences.
          </p>
        </div>
        <div className="flex gap-[8px]">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-4 py-2 border border-[#c3c5d9] text-[#505f76] font-label-md text-label-md rounded hover:bg-[#ededfb] transition-colors"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#003ec7] text-white font-label-md text-label-md rounded hover:bg-[#0052ff] transition-colors shadow-sm"
          >
            Save Configuration
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-[24px]">
        {/* General Settings Section */}
        <section className="col-span-12 lg:col-span-4 space-y-[24px]">
          <div className="bg-white border border-[#c3c5d9] p-[24px] rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.02)]">
            <h3 className="font-headline-sm text-headline-sm mb-[16px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003ec7]">business</span>
              Company Identity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[#ededfb] rounded-lg border border-dashed border-[#737688]">
                <div className="w-16 h-16 bg-white rounded border border-[#c3c5d9] flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-[#737688]">add_a_photo</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-[#191b25]">Organization Logo</p>
                  <p className="text-[11px] text-[#737688]">Recommended: 200x200px PNG/SVG</p>
                  <button
                    type="button"
                    onClick={() => alert("Upload logo dialog triggered.")}
                    className="mt-2 text-[#003ec7] text-xs font-bold hover:underline"
                  >
                    Upload New
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-[#434656]">Legal Entity Name</label>
                <input
                  className="w-full border border-[#c3c5d9] rounded p-2 text-body-md bg-white focus:ring-1 focus:ring-[#003ec7] outline-none"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-[#434656]">Tax ID / VAT Number</label>
                <input
                  className="w-full border border-[#c3c5d9] rounded p-2 text-body-md bg-white focus:ring-1 focus:ring-[#003ec7] outline-none"
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-[#434656]">Support Email</label>
                <input
                  className="w-full border border-[#c3c5d9] rounded p-2 text-body-md bg-white focus:ring-1 focus:ring-[#003ec7] outline-none"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#c3c5d9] p-[24px] rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.02)]">
            <h3 className="font-headline-sm text-headline-sm mb-[16px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003ec7]">notifications_active</span>
              Notification Streams
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body-md text-body-md font-semibold">Critical Maintenance Alerts</p>
                  <p className="text-[11px] text-[#737688]">Instant SMS/Email for engine failures</p>
                </div>
                <div
                  onClick={() => setNotifyMaintenance(!notifyMaintenance)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                    notifyMaintenance ? "bg-[#003ec7]" : "bg-[#c3c5d9]"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                      notifyMaintenance ? "right-1" : "left-1"
                    }`}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body-md text-body-md font-semibold">Fuel Inefficiency Reports</p>
                  <p className="text-[11px] text-[#737688]">Weekly summary for Fleet Managers</p>
                </div>
                <div
                  onClick={() => setNotifyFuel(!notifyFuel)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                    notifyFuel ? "bg-[#003ec7]" : "bg-[#c3c5d9]"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                      notifyFuel ? "right-1" : "left-1"
                    }`}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body-md text-body-md font-semibold">Driver Schedule Changes</p>
                  <p className="text-[11px] text-[#737688]">Push notifications to mobile app</p>
                </div>
                <div
                  onClick={() => setNotifySchedule(!notifySchedule)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                    notifySchedule ? "bg-[#003ec7]" : "bg-[#c3c5d9]"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                      notifySchedule ? "right-1" : "left-1"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RBAC Table Section */}
        <section className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-[#c3c5d9] rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.02)] overflow-hidden h-full flex flex-col">
            <div className="p-[24px] border-b border-[#c3c5d9] flex justify-between items-center">
              <div>
                <h3 className="font-headline-sm text-headline-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#003ec7]">security</span>
                  Role-Based Access Control (RBAC)
                </h3>
                <p className="text-body-sm text-[#737688]">Define module-level permissions for core organizational roles.</p>
              </div>
              <button
                type="button"
                onClick={() => alert("Add Custom Role dialog triggered.")}
                className="flex items-center gap-2 text-[#003ec7] font-label-md text-label-md px-3 py-1.5 border border-[#003ec7]/20 rounded hover:bg-[#0052ff]/10 transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span> Add Custom Role
              </button>
            </div>
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f3f2ff]">
                  <tr>
                    <th className="px-6 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9]">Module Permissions</th>
                    <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9] text-center">Fleet Manager</th>
                    <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9] text-center">Dispatcher</th>
                    <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9] text-center">Safety Officer</th>
                    <th className="px-4 py-4 font-label-md text-label-md text-[#191b25] border-b border-[#c3c5d9] text-center">Financial Analyst</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c5d9]">
                  {rbacData.map((row) => {
                    const isMaintenanceDispatcher = row.id === "maintenance" && row.permissions.dispatcher === "read";
                    return (
                      <tr key={row.id} className="hover:bg-[#ededfb]/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-body-md text-body-md font-medium">{row.module}</p>
                          <p className="text-[10px] text-[#737688] uppercase tracking-tight">{row.subtitle}</p>
                        </td>
                        <td
                          className="px-4 py-4 text-center"
                          onClick={() => togglePermission(row.id, "fleetManager")}
                        >
                          {renderPermissionIcon(row.permissions.fleetManager)}
                        </td>
                        <td
                          className="px-4 py-4 text-center"
                          onClick={() => togglePermission(row.id, "dispatcher")}
                        >
                          {renderPermissionIcon(
                            row.permissions.dispatcher,
                            isMaintenanceDispatcher ? "edit" : undefined
                          )}
                        </td>
                        <td
                          className="px-4 py-4 text-center"
                          onClick={() => togglePermission(row.id, "safetyOfficer")}
                        >
                          {renderPermissionIcon(row.permissions.safetyOfficer)}
                        </td>
                        <td
                          className="px-4 py-4 text-center"
                          onClick={() => togglePermission(row.id, "financialAnalyst")}
                        >
                          {renderPermissionIcon(row.permissions.financialAnalyst)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#f3f2ff] border-t border-[#c3c5d9] text-[11px] text-[#737688] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              Pro-Tip: "Check Circle" indicates Read/Write access. "Eye" or "Edit" indicates limited access. "Circle Minus" indicates no access. Click any icon to change permissions.
            </div>
          </div>
        </section>
      </div>

      {/* Integrations & Advanced (Bottom Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
        <div className="bg-[#ededfb] p-6 rounded-xl border border-[#c3c5d9] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#003ec7]/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <h4 className="font-headline-sm text-headline-sm mb-2">API Access</h4>
          <p className="text-body-sm text-[#434656] mb-4">Manage webhooks and external integration keys for ERP systems.</p>
          <button
            type="button"
            onClick={() => alert("API Keys Configuration modal opened.")}
            className="text-[#003ec7] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all"
          >
            Configure Keys <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>

        <div className="bg-[#ededfb] p-6 rounded-xl border border-[#c3c5d9] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#952200]/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <h4 className="font-headline-sm text-headline-sm mb-2">Data Backup</h4>
          <p className="text-body-sm text-[#434656] mb-4">Automate weekly exports of historical trip and maintenance logs.</p>
          <button
            type="button"
            onClick={() => alert("Schedule Export dialog triggered.")}
            className="text-[#003ec7] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all"
          >
            Schedule Export <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>

        <div className="bg-[#ededfb] p-6 rounded-xl border border-[#c3c5d9] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#505f76]/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <h4 className="font-headline-sm text-headline-sm mb-2">Audit Logs</h4>
          <p className="text-body-sm text-[#434656] mb-4">Review system activity, login history, and permission changes.</p>
          <button
            type="button"
            onClick={() => alert("Audit Activity viewer opened.")}
            className="text-[#003ec7] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all"
          >
            View Activity <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
