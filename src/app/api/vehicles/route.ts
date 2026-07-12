// src/app/api/vehicles/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { VehicleType, VehicleStatus } from "@prisma/client";

// Zod Schema for Vehicle Creation Validation
const vehicleSchema = z.object({
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
  status: z.nativeEnum(VehicleStatus).default(VehicleStatus.AVAILABLE),
});

// GET: List Vehicles with search and filter parameters
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") as VehicleType | null;
    const region = searchParams.get("region") || "";
    const status = searchParams.get("status") as VehicleStatus | null;

    // Build filter clause
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { registrationNumber: { contains: search } },
        { model: { contains: search } },
        { make: { contains: search } },
      ];
    }

    if (type) {
      whereClause.type = type;
    }

    if (region) {
      whereClause.region = region;
    }

    if (status) {
      whereClause.status = status;
    }

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("GET Vehicles Error:", error);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

// POST: Register New Vehicle
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = vehicleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Check unique registration number
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: parsed.data.registrationNumber },
    });

    if (existing) {
      return NextResponse.json(
        { error: { fieldErrors: { registrationNumber: ["Registration number already registered"] } } },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: parsed.data,
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("POST Vehicle Error:", error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
