import { supabase } from "@/lib/supabase";

export interface MaintenanceLogInput {
  maintenance_number: string;
  vehicle_id: string;
  maintenance_type: string;
  description?: string | null;
  service_provider?: string | null;
  cost?: number;
  status?: "open" | "in_progress" | "completed";
  opened_at?: string;
  closed_at?: string | null;
  notes?: string | null;
}

export const maintenanceService = {
  async getAll() {
    const { data, error } = await supabase
      .from("maintenance_logs")
      .select("*, vehicle:vehicles(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("maintenance_logs")
      .select("*, vehicle:vehicles(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(log: MaintenanceLogInput) {
    const { data, error } = await supabase
      .from("maintenance_logs")
      .insert([log])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<MaintenanceLogInput>) {
    const { data, error } = await supabase
      .from("maintenance_logs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("maintenance_logs").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
