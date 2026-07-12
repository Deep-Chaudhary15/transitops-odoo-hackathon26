import React from "react";
import { fuelService } from "@/services/fuel.service";
import { expenseService } from "@/services/expense.service";
import { vehicleService } from "@/services/vehicle.service";
import { FuelTable } from "./fuel-table";

export default async function FuelExpensesPage() {
  let fuelLogs: any[] = [];
  let expenses: any[] = [];
  let vehicles: any[] = [];

  try {
    [fuelLogs, expenses, vehicles] = await Promise.all([
      fuelService.getAll(),
      expenseService.getAll(),
      vehicleService.getAll(),
    ]);
  } catch (error) {
    console.error("Failed to fetch fuel/expenses/vehicles:", error);
  }

  return (
    <div className="p-[24px] max-w-[1440px] mx-auto w-full space-y-[24px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#c3c5d9] pb-[16px] gap-4">
        <div>
          <h2 className="font-display-lg text-display-lg text-[#191b25]">Fuel Logs & Operational Expenditure</h2>
          <p className="font-body-md text-body-md text-[#434656]">
            Audit fuel efficiency, record station purchases, track route tolls, and monitor cost per kilometer.
          </p>
        </div>
      </div>

      <FuelTable initialFuel={fuelLogs} initialExpenses={expenses} vehicles={vehicles} />
    </div>
  );
}
