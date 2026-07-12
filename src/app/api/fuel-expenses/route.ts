import { NextResponse } from "next/server";
import { fuelService } from "@/services/fuel.service";
import { expenseService } from "@/services/expense.service";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [fuel, expenses] = await Promise.all([
      fuelService.getAll(),
      expenseService.getAll(),
    ]);
    return NextResponse.json({ fuel, expenses });
  } catch (error: any) {
    console.error("GET Fuel/Expenses Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (body.type === "FUEL") {
      const log = await fuelService.create(body);
      return NextResponse.json(log, { status: 201 });
    } else {
      const exp = await expenseService.create(body);
      return NextResponse.json(exp, { status: 201 });
    }
  } catch (error: any) {
    console.error("POST Fuel/Expense Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create entry" }, { status: 500 });
  }
}
