// src/app/drivers/page.tsx
import React from "react";
import { driverService } from "@/services/driver.service";
import { DriverTable } from "./driver-table";

export default async function DriversPage() {
  let drivers: any[] = [];
  try {
    drivers = await driverService.getAll();
  } catch (error) {
    console.error("Failed to load drivers from Supabase:", error);
  }

  // Format expiry dates and numbers to safe formats for serialisation
  const serializedDrivers = drivers.map((d: any) => ({
    id: d.id,
    profile_id: d.profile_id,
    employee_code: d.employee_code,
    full_name: d.full_name,
    contact_number: d.contact_number,
    license_number: d.license_number,
    license_category: d.license_category,
    license_expiry: d.license_expiry, // Already string in Supabase
    joining_date: d.joining_date,
    safety_score: Number(d.safety_score),
    status: d.status,
  }));

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#191b25]">Drivers &amp; Safety Profiles</h2>
        <p className="text-sm text-[#505f76]">
          Monitor operator licensing, safety scores, and operational statuses.
        </p>
      </div>

      {/* Driver Interactive Table Container */}
      <DriverTable initialDrivers={serializedDrivers} />
    </div>
  );
}
