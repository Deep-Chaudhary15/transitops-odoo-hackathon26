import React from "react";
import { maintenanceService } from "@/services/maintenance.service";
import { vehicleService } from "@/services/vehicle.service";
import { MaintenanceTable } from "./maintenance-table";

export default async function MaintenancePage() {
  let logs: any[] = [];
  let vehicles: any[] = [];

  try {
    [logs, vehicles] = await Promise.all([
      maintenanceService.getAll(),
      vehicleService.getAll(),
    ]);
  } catch (error) {
    console.error("Failed to fetch maintenance logs/vehicles:", error);
  }

  return (
    <div className="p-[24px] max-w-[1440px] mx-auto w-full space-y-[24px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#c3c5d9] pb-[16px] gap-4">
        <div>
          <h2 className="font-display-lg text-display-lg text-[#191b25]">Preventive Maintenance & Work Orders</h2>
          <p className="font-body-md text-body-md text-[#434656]">
            Schedule service work orders, track vehicle repair expenses, and ensure roadworthiness.
          </p>
        </div>
      </div>

      <MaintenanceTable initialLogs={logs} vehicles={vehicles} />
    </div>
  );
}
