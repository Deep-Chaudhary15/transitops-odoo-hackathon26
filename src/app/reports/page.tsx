import React from "react";
import { tripService } from "@/services/trip.service";
import { fuelService } from "@/services/fuel.service";
import { expenseService } from "@/services/expense.service";
import { maintenanceService } from "@/services/maintenance.service";
import { vehicleService } from "@/services/vehicle.service";
import { ReportsView } from "./reports-view";

export default async function ReportsPage() {
  let trips: any[] = [];
  let fuelLogs: any[] = [];
  let expenses: any[] = [];
  let maintenanceLogs: any[] = [];
  let vehicles: any[] = [];

  try {
    [trips, fuelLogs, expenses, maintenanceLogs, vehicles] = await Promise.all([
      tripService.getAll(),
      fuelService.getAll(),
      expenseService.getAll(),
      maintenanceService.getAll(),
      vehicleService.getAll(),
    ]);
  } catch (error) {
    console.error("Failed to fetch analytics data:", error);
  }

  return (
    <div className="p-[24px] max-w-[1440px] mx-auto w-full space-y-[24px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#c3c5d9] pb-[16px] gap-4">
        <div>
          <h2 className="font-display-lg text-display-lg text-[#191b25]">Fleet Intelligence & BI Reports</h2>
          <p className="font-body-md text-body-md text-[#434656]">
            Aggregate total cost of ownership (TCO), fleet utilization charts, and sustainability analytics.
          </p>
        </div>
      </div>

      <ReportsView
        trips={trips}
        fuelLogs={fuelLogs}
        expenses={expenses}
        maintenanceLogs={maintenanceLogs}
        vehicles={vehicles}
      />
    </div>
  );
}
