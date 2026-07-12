// src/app/api/drivers/route.ts
import { NextResponse } from "next/server";
import { driverService } from "@/services/driver.service";
import { auth } from "@/lib/auth";
import { z } from "zod";

const driverSchema = z.object({
  employee_code: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9-]+$/, "Employee code must be uppercase alphanumeric"),
  full_name: z.string().min(1, "Full name is required"),
  contact_number: z.string().optional().nullable(),
  license_number: z.string().min(5, "License number is required"),
  license_category: z.string().min(1, "License category is required"),
  license_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry must be YYYY-MM-DD"),
  joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Joining date must be YYYY-MM-DD").optional().nullable(),
  safety_score: z.coerce.number().int().min(0).max(100).default(100),
  status: z.enum(["available", "on_trip", "off_duty", "suspended"]).default("available"),
});

// GET: Fetch all drivers
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drivers = await driverService.getAll();
    return NextResponse.json(drivers);
  } catch (error: any) {
    console.error("GET Drivers Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch drivers" }, { status: 500 });
  }
}

// POST: Create driver
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = driverSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const driver = await driverService.create(parsed.data);
    return NextResponse.json(driver, { status: 201 });
  } catch (error: any) {
    console.error("POST Driver Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create driver" }, { status: 500 });
  }
}
