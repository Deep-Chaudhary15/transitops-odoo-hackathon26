// src/app/api/vehicles/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { VehicleType, VehicleStatus } from "@prisma/client";

// Zod Schema for Vehicle Update Validation
const updateVehicleSchema = z.object({
  registrationNumber: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9- ]+$/, "Registration number must be uppercase alphanumeric"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  type: z.nativeEnum(VehicleType),
  capacityKg: z.coerce.number().positive("Capacity must be positive"),
  odometer: z.coerce.number().nonnegative("Odometer must be non-negative"),
  acquisitionCost: z.coerce.number().positive("Acquisition cost must be positive"),
  region: z.string().min(1, "Region is required"),
  status: z.nativeEnum(VehicleStatus),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT: Update vehicle
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateVehicleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 444 });
    }

    // Check unique registration number (if changed)
    if (parsed.data.registrationNumber !== existingVehicle.registrationNumber) {
      const duplicate = await prisma.vehicle.findUnique({
        where: { registrationNumber: parsed.data.registrationNumber },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: { fieldErrors: { registrationNumber: ["Registration number already in use by another vehicle"] } } },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT Vehicle Error:", error);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

// DELETE: Remove vehicle
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if vehicle is assigned to active trips
    const activeTripsCount = await prisma.trip.count({
      where: {
        vehicleId: id,
        status: "ACTIVE",
      },
    });

    if (activeTripsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete vehicle with active dispatched trips" },
        { status: 400 }
      );
    }

    // Delete associated logs (Cascaded or deleted manually)
    await prisma.maintenance.deleteMany({ where: { vehicleId: id } });
    await prisma.fuelLog.deleteMany({ where: { vehicleId: id } });

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Vehicle Error:", error);
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
