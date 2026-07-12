import React from "react";
import { tripService } from "@/services/trip.service";
import { MyTripsView } from "./my-trips-view";

export default async function MyTripsPage() {
  let trips: any[] = [];
  try {
    trips = await tripService.getAll();
  } catch (error) {
    console.error("Failed to fetch trips for driver:", error);
  }

  return (
    <div className="p-[24px] max-w-[1440px] mx-auto w-full space-y-[24px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#c3c5d9] pb-[16px] gap-4">
        <div>
          <h2 className="font-display-lg text-display-lg text-[#191b25]">Driver Portal & Active Assignments</h2>
          <p className="font-body-md text-body-md text-[#434656]">
            Manage assigned routes, report checkpoints, log fuel stops, and verify vehicle inspections.
          </p>
        </div>
      </div>

      <MyTripsView initialTrips={trips} />
    </div>
  );
}
