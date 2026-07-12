import { supabase } from "@/lib/supabase";

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
    const { data, error } = await supabase
      .from("expenses")
      .select("*, vehicle:vehicles(*), trip:trips(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
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
