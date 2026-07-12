// src/app/vehicles/page.tsx
import React from "react";
import { prisma } from "@/lib/prisma";
import { VehicleTable } from "./vehicle-table";

export default async function VehiclesPage() {
  // Fetch vehicles list directly on the server
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Get distinct regions for filter dropdown
  const distinctRegions = await prisma.vehicle.findMany({
    select: { region: true },
    distinct: ["region"],
    where: { region: { not: null } },
  });
  const regions = distinctRegions.map((r) => r.region).filter(Boolean) as string[];

  // Convert decimal/float fields to numbers to prevent serialization warnings
  const serializedVehicles = vehicles.map((v) => ({
    ...v,
    capacityKg: Number(v.capacityKg),
    odometer: Number(v.odometer),
    acquisitionCost: Number(v.acquisitionCost),
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#191b25]">Vehicle Registry</h2>
        <p className="text-sm text-[#505f76]">
          View, search, filter, and manage fleet assets.
        </p>
      </div>

      {/* Interactivity Container */}
      <VehicleTable initialVehicles={serializedVehicles} distinctRegions={regions} />
    </div>
  );
}
