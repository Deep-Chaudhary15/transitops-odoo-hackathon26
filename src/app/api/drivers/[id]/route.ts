// src/app/api/drivers/[id]/route.ts
import { NextResponse } from "next/server";
import { driverService } from "@/services/driver.service";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateDriverSchema = z.object({
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
  safety_score: z.coerce.number().int().min(0).max(100),
  status: z.enum(["available", "on_trip", "off_duty", "suspended"]),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT: Update driver
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateDriverSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await driverService.update(id, parsed.data);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT Driver Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update driver" }, { status: 500 });
  }
}

// DELETE: Remove driver
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await driverService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Driver Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete driver" }, { status: 500 });
  }
}
