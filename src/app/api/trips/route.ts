import { NextResponse } from "next/server";
import { tripService } from "@/services/trip.service";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trips = await tripService.getAll();
    return NextResponse.json(trips);
  } catch (error: any) {
    console.error("GET Trips Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const trip = await tripService.create(body);
    return NextResponse.json(trip, { status: 201 });
  } catch (error: any) {
    console.error("POST Trip Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create trip" }, { status: 500 });
  }
}
