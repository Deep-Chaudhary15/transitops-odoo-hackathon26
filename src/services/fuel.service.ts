import { supabase } from "@/lib/supabase";

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
    const { data, error } = await supabase
      .from("fuel_logs")
      .select("*, vehicle:vehicles(*), trip:trips(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
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
