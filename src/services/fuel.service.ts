import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export interface FuelLogInput {
  vehicle_id: string;
  trip_id?: string | null;
  fuel_date: string;
  liters: number;
  price_per_liter: number;
  odometer?: number | null;
  station_name?: string | null;
  notes?: string | null;
}

export const fuelService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("fuel_logs")
        .select("*, vehicle:vehicles(*), trip:trips(*)")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Supabase fuel query failed or empty, falling back to local Prisma DB:", e);
    }

    const localLogs = await prisma.fuelLog.findMany({
      include: { vehicle: true },
      orderBy: { date: "desc" },
    });

    return localLogs.map((f) => ({
      id: f.id,
      vehicle_id: f.vehicleId,
      fuel_date: f.date.toISOString(),
      liters: Number(f.liters),
      price_per_liter: Number(f.costPerLiter),
      total_cost: Number(f.totalCost),
      odometer: Number(f.odometer),
      station_name: "IndianOil Expressway Plaza",
      notes: f.notes,
      created_at: f.createdAt.toISOString(),
      vehicle: f.vehicle
        ? {
            id: f.vehicle.id,
            registration_number: f.vehicle.registrationNumber,
            model: f.vehicle.model,
          }
        : null,
    }));
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("fuel_logs")
      .select("*, vehicle:vehicles(*), trip:trips(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(log: FuelLogInput) {
    const { data, error } = await supabase
      .from("fuel_logs")
      .insert([log])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<FuelLogInput>) {
    const { data, error } = await supabase
      .from("fuel_logs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("fuel_logs").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
