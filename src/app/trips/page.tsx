import React from "react";
import { tripService } from "@/services/trip.service";
import { vehicleService } from "@/services/vehicle.service";
import { driverService } from "@/services/driver.service";
import { TripTable } from "./trip-table";

export default async function TripsPage() {
  let trips: any[] = [];
  let vehicles: any[] = [];
  let drivers: any[] = [];

  try {
    [trips, vehicles, drivers] = await Promise.all([
      tripService.getAll(),
      vehicleService.getAll(),
      driverService.getAll(),
    ]);
  } catch (error) {
    console.error("Failed to fetch trips/vehicles/drivers:", error);
  }

  return (
    <div className="p-[24px] max-w-[1440px] mx-auto w-full space-y-[24px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#c3c5d9] pb-[16px] gap-4">
        <div>
          <h2 className="font-display-lg text-display-lg text-[#191b25]">Trip Dispatcher & Tracking</h2>
          <p className="font-body-md text-body-md text-[#434656]">
            Real-time route assignment, active manifest tracking, and telemetry dispatch.
          </p>
        </div>
      </div>

      <TripTable initialTrips={trips} vehicles={vehicles} drivers={drivers} />
    </div>
  );
}
