import { NextResponse } from "next/server";
import { maintenanceService } from "@/services/maintenance.service";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await maintenanceService.getAll();
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("GET Maintenance Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch maintenance logs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const log = await maintenanceService.create(body);
    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    console.error("POST Maintenance Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create maintenance log" }, { status: 500 });
  }
}
