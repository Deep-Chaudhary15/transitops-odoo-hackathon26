// src/app/vehicles/[id]/edit/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditVehicleForm } from "./edit-form";

interface EditVehiclePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { id } = await params;

  // Query specific vehicle on the server
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    notFound();
  }

  // Convert decimal/float fields to numbers to prevent serialization warnings
  const serializedVehicle = {
    ...vehicle,
    capacityKg: Number(vehicle.capacityKg),
    odometer: Number(vehicle.odometer),
    acquisitionCost: Number(vehicle.acquisitionCost),
    createdAt: vehicle.createdAt.toISOString(),
    updatedAt: vehicle.updatedAt.toISOString(),
  };

  return <EditVehicleForm vehicle={serializedVehicle} />;
}
