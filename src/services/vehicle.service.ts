import { supabase } from "@/lib/supabase";

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
    if (error) throw error;
    return data;
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
