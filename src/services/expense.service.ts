import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export interface ExpenseInput {
  vehicle_id?: string | null;
  trip_id?: string | null;
  maintenance_id?: string | null;
  expense_type: "fuel" | "toll" | "service" | "repairs" | "insurance" | "parking" | "other";
  amount: number;
  expense_date: string;
  description?: string | null;
  receipt_url?: string | null;
}

export const expenseService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*, vehicle:vehicles(*), trip:trips(*)")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Supabase expense query failed or empty, falling back to local Prisma DB:", e);
    }

    const localExpenses = await prisma.expense.findMany({
      include: { trip: { include: { vehicle: true } } },
      orderBy: { date: "desc" },
    });

    return localExpenses.map((e) => ({
      id: e.id,
      vehicle_id: e.trip ? e.trip.vehicleId : null,
      trip_id: e.tripId,
      maintenance_id: null,
      expense_type: (e.category.toLowerCase() as any) || "other",
      amount: Number(e.amount),
      expense_date: e.date.toISOString(),
      description: e.notes || `${e.category} expense`,
      receipt_url: null,
      created_at: e.createdAt.toISOString(),
      trip: e.trip ? { id: e.trip.id, source: e.trip.source, destination: e.trip.destination } : null,
      vehicle:
        e.trip && e.trip.vehicle
          ? {
              id: e.trip.vehicle.id,
              registration_number: e.trip.vehicle.registrationNumber,
              model: e.trip.vehicle.model,
            }
          : null,
    }));
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("expenses")
      .select("*, vehicle:vehicles(*), trip:trips(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(expense: ExpenseInput) {
    const { data, error } = await supabase
      .from("expenses")
      .insert([expense])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<ExpenseInput>) {
    const { data, error } = await supabase
      .from("expenses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
