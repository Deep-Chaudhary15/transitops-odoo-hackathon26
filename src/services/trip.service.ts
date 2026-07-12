import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export interface TripInput {
  trip_number: string;
  vehicle_id: string;
  driver_id: string;
  source: string;
  destination: string;
  cargo_weight: number;
  planned_distance: number;
  actual_distance?: number | null;
  revenue?: number;
  status?: "draft" | "dispatched" | "completed" | "cancelled" | "active" | "pending";
  planned_departure?: string | null;
  notes?: string | null;
}

export const tripService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*, vehicle:vehicles(*), driver:drivers(*)")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Supabase trips query failed or empty, falling back to local Prisma DB:", e);
    }

    const localTrips = await prisma.trip.findMany({
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: "desc" },
    });

    return localTrips.map((t, index) => ({
      id: t.id,
      trip_number: `TRP-${2001 + index}`,
      vehicle_id: t.vehicleId,
      driver_id: t.driverId,
      source: t.source,
      destination: t.destination,
      cargo_weight: Number(t.cargoWeightKg),
      planned_distance: Number(t.plannedDistance),
      actual_distance: t.actualDistance ? Number(t.actualDistance) : null,
      status: t.status.toLowerCase() as any,
      planned_departure: t.dispatchedAt ? t.dispatchedAt.toISOString() : null,
      notes: t.notes,
      created_at: t.createdAt.toISOString(),
      vehicle: t.vehicle
        ? {
            id: t.vehicle.id,
            registration_number: t.vehicle.registrationNumber,
            model: t.vehicle.model,
            vehicle_type: t.vehicle.type.toLowerCase(),
          }
        : null,
      driver: t.driver
        ? {
            id: t.driver.id,
            full_name: t.driver.name,
            contact_number: t.driver.contact,
          }
        : null,
    }));
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("trips")
      .select("*, vehicle:vehicles(*), driver:drivers(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(trip: TripInput) {
    const { data, error } = await supabase
      .from("trips")
      .insert([trip])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<TripInput>) {
    const { data, error } = await supabase
      .from("trips")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
