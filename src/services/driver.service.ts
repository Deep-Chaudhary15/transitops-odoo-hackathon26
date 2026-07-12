import { supabase } from "@/lib/supabase";

export interface DriverInput {
  employee_code: string;
  full_name: string;
  contact_number?: string | null;
  license_number: string;
  license_category: string;
  license_expiry: string; // date string
  joining_date?: string | null;
  safety_score?: number;
  status?: "available" | "on_trip" | "off_duty" | "suspended";
}

export const driverService = {
  async getAll() {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(driver: DriverInput) {
    const { data, error } = await supabase
      .from("drivers")
      .insert([driver])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<DriverInput>) {
    const { data, error } = await supabase
      .from("drivers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("drivers").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
