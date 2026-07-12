import { supabase } from "@/lib/supabase";

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
  status?: "draft" | "dispatched" | "completed" | "cancelled";
  planned_departure?: string | null;
  notes?: string | null;
}

export const tripService = {
  async getAll() {
    const { data, error } = await supabase
      .from("trips")
      .select("*, vehicle:vehicles(*), driver:drivers(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
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
