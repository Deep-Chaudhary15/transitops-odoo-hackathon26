import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export interface VehicleInput {
  registration_number: string;
  vehicle_name: string;
  model: string;
  manufacturer?: string | null;
  vehicle_type: string;
  fuel_type?: string | null;
  maximum_load_capacity: number;
  current_odometer: number;
  acquisition_cost: number;
  purchase_date?: string | null;
  status?: "available" | "on_trip" | "in_shop" | "retired";
  region?: string | null;
}

export const vehicleService = {
  async getAll(filters?: { type?: string; region?: string; status?: string }) {
    try {
      let query = supabase.from("vehicles").select("*");

      if (filters?.type) {
        query = query.eq("vehicle_type", filters.type);
      }
      if (filters?.region) {
        query = query.eq("region", filters.region);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Supabase vehicles query failed or empty, falling back to local Prisma DB:", e);
    }

    const where: any = {};
    if (filters?.type) where.type = filters.type.toUpperCase();
    if (filters?.region) where.region = filters.region;
    if (filters?.status) where.status = filters.status.toUpperCase();

    const localVehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return localVehicles.map((v) => ({
      id: v.id,
      registration_number: v.registrationNumber,
      vehicle_name: `${v.make} ${v.model}`,
      model: v.model,
      manufacturer: v.make,
      vehicle_type: v.type.toLowerCase(),
      fuel_type: "Electric",
      maximum_load_capacity: Number(v.capacityKg),
      current_odometer: Number(v.odometer),
      acquisition_cost: Number(v.acquisitionCost),
      purchase_date: `${v.year}-01-01`,
      status: v.status.toLowerCase() as any,
      region: v.region,
      created_at: v.createdAt.toISOString(),
      updated_at: v.updatedAt.toISOString(),
    }));
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(vehicle: VehicleInput) {
    const { data, error } = await supabase
      .from("vehicles")
      .insert([vehicle])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<VehicleInput>) {
    const { data, error } = await supabase
      .from("vehicles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
