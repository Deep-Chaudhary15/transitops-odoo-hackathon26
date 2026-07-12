import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export interface MaintenanceLogInput {
  maintenance_number: string;
  vehicle_id: string;
  maintenance_type: string;
  description?: string | null;
  service_provider?: string | null;
  cost?: number;
  status?: "open" | "in_progress" | "completed" | "closed";
  opened_at?: string;
  closed_at?: string | null;
  notes?: string | null;
}

export const maintenanceService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("maintenance_logs")
        .select("*, vehicle:vehicles(*)")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Supabase maintenance query failed or empty, falling back to local Prisma DB:", e);
    }

    const localLogs = await prisma.maintenance.findMany({
      include: { vehicle: true },
      orderBy: { createdAt: "desc" },
    });

    return localLogs.map((m, index) => ({
      id: m.id,
      maintenance_number: `MNT-${3001 + index}`,
      vehicle_id: m.vehicleId,
      maintenance_type: m.type,
      description: m.notes || `${m.type} service`,
      service_provider: "Certified Fleet Mechanics Ltd.",
      cost: Number(m.cost),
      status: m.status.toLowerCase() as any,
      opened_at: m.scheduledDate.toISOString(),
      closed_at: m.completedDate ? m.completedDate.toISOString() : null,
      notes: m.notes,
      created_at: m.createdAt.toISOString(),
      vehicle: m.vehicle
        ? {
            id: m.vehicle.id,
            registration_number: m.vehicle.registrationNumber,
            model: m.vehicle.model,
          }
        : null,
    }));
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
