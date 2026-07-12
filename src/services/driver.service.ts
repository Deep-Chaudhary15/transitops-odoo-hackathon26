import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

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
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Supabase drivers query failed or empty, falling back to local Prisma DB:", e);
    }

    const localDrivers = await prisma.driver.findMany({
      orderBy: { createdAt: "desc" },
    });

    return localDrivers.map((d, index) => ({
      id: d.id,
      employee_code: `EMP-${1001 + index}`,
      full_name: d.name,
      contact_number: d.contact,
      license_number: d.licenseNumber,
      license_category: d.licenseCategory,
      license_expiry: d.licenseExpiry instanceof Date ? d.licenseExpiry.toISOString().split("T")[0] : String(d.licenseExpiry),
      joining_date: d.createdAt instanceof Date ? d.createdAt.toISOString().split("T")[0] : String(d.createdAt),
      safety_score: Number(d.safetyScore),
      status: d.status.toLowerCase() as any,
    }));
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
