"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { VehicleType, VehicleStatus } from "@prisma/client";

// Zod form validation schema
const vehicleFormSchema = z.object({
  registrationNumber: z
    .string()
    .min(3, "Plate number must be at least 3 characters")
    .max(20, "Plate number must be under 20 characters")
    .regex(/^[A-Z0-9- ]+$/, "Must contain only uppercase alphanumeric characters, spaces, or hyphens"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  type: z.nativeEnum(VehicleType),
  capacityKg: z.coerce.number().positive("Capacity must be a positive number"),
  odometer: z.coerce.number().nonnegative("Odometer must be non-negative"),
  acquisitionCost: z.coerce.number().positive("Cost must be a positive number"),
  region: z.string().min(1, "Region is required"),
  status: z.nativeEnum(VehicleStatus).default(VehicleStatus.AVAILABLE),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export default function NewVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      registrationNumber: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      type: VehicleType.TRUCK,
      capacityKg: 15000,
      odometer: 0,
      acquisitionCost: 1000000,
      region: "",
      status: VehicleStatus.AVAILABLE,
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: VehicleFormValues) => {
    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        // Handle unique field constraint violation from API
        if (result.error?.fieldErrors?.registrationNumber) {
          throw new Error("This registration number is already in use by another vehicle");
        }
        throw new Error(result.error || "Failed to create vehicle");
      }

      router.push("/vehicles");
      router.refresh();
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#505f76] uppercase tracking-wider">
        <Link href="/vehicles" className="hover:text-[#0052ff] flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Vehicles
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191b25] font-bold">Add New Vehicle</span>
      </div>

      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-[#191b25]">Register Fleet Asset</h2>
        <p className="text-sm text-[#505f76]">
          Enter the fleet specifications to add a new vehicle to your inventory.
        </p>
      </div>

      {serverError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
          {serverError}
        </div>
      )}

      {/* Form Bento Layout */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Main Specifications - 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Identity & Registration */}
          <div className="bg-white border border-[#e1e1ef] p-6 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center gap-3 pb-2 border-b border-[#e1e1ef]">
              <div className="w-10 h-10 rounded-lg bg-[#f3f2ff] flex items-center justify-center text-[#0052ff]">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <h3 className="text-lg font-bold text-[#191b25]">Identity &amp; Registration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="plate_number">
                  Plate / Registration Number
                </label>
                <input
                  id="plate_number"
                  placeholder="e.g. GJ-01-XX-9999"
                  {...register("registrationNumber")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none uppercase"
                />
                {errors.registrationNumber && (
                  <p className="text-xs font-medium text-red-600">{errors.registrationNumber.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="region">
                  Operational Region
                </label>
                <input
                  id="region"
                  placeholder="e.g. Saurashtra, Central Gujarat"
                  {...register("region")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.region && (
                  <p className="text-xs font-medium text-red-600">{errors.region.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="make">
                  Manufacturer (Make)
                </label>
                <input
                  id="make"
                  placeholder="e.g. Tata, Mahindra, BharatBenz"
                  {...register("make")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.make && (
                  <p className="text-xs font-medium text-red-600">{errors.make.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="model">
                  Model Name
                </label>
                <input
                  id="model"
                  placeholder="e.g. Signa 5525, LPT 1918"
                  {...register("model")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.model && (
                  <p className="text-xs font-medium text-red-600">{errors.model.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white border border-[#e1e1ef] p-6 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center gap-3 pb-2 border-b border-[#e1e1ef]">
              <div className="w-10 h-10 rounded-lg bg-[#f3f2ff] flex items-center justify-center text-[#0052ff]">
                <span className="material-symbols-outlined">settings_input_component</span>
              </div>
              <h3 className="text-lg font-bold text-[#191b25]">Technical Specifications</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="vehicle_type">
                  Vehicle Type
                </label>
                <select
                  id="vehicle_type"
                  {...register("type")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                >
                  {Object.values(VehicleType).map((t) => (
                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-xs font-medium text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="year">
                  Manufacturing Year
                </label>
                <input
                  id="year"
                  type="number"
                  placeholder={new Date().getFullYear().toString()}
                  {...register("year")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.year && (
                  <p className="text-xs font-medium text-red-600">{errors.year.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="capacity">
                  Cargo Capacity (kg)
                </label>
                <input
                  id="capacity"
                  type="number"
                  placeholder="15000"
                  {...register("capacityKg")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.capacityKg && (
                  <p className="text-xs font-medium text-red-600">{errors.capacityKg.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="odometer">
                  Initial Odometer (km)
                </label>
                <input
                  id="odometer"
                  type="number"
                  placeholder="0"
                  {...register("odometer")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.odometer && (
                  <p className="text-xs font-medium text-red-600">{errors.odometer.message}</p>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="cost">
                  Acquisition Cost (INR)
                </label>
                <input
                  id="cost"
                  type="number"
                  placeholder="1000000"
                  {...register("acquisitionCost")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.acquisitionCost && (
                  <p className="text-xs font-medium text-red-600">{errors.acquisitionCost.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Side Panel - Actions & Notes - 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Asset Info Card */}
          <div className="bg-white border border-[#e1e1ef] p-6 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-[#191b25]">Asset Profile</h3>
            <div className="w-full aspect-video rounded-lg border-2 border-dashed border-[#c3c5d9] bg-[#f3f2ff]/30 flex flex-col items-center justify-center text-center p-4">
              <span className="material-symbols-outlined text-[40px] text-[#737688] mb-1">add_a_photo</span>
              <p className="text-xs font-bold text-[#191b25]">Asset Image Upload</p>
              <p className="text-[10px] text-[#505f76] mt-0.5">Mocked: upload bypassed for hackathon</p>
            </div>
          </div>

          {/* System Note */}
          <div className="bg-[#0052ff]/5 border border-[#0052ff]/20 p-5 rounded-xl space-y-2">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#0052ff]">info</span>
              <div>
                <h4 className="text-xs font-bold text-[#003ec7] uppercase tracking-wider">Logistics Note</h4>
                <p className="text-xs text-[#505f76] leading-relaxed mt-1">
                  Registration number formatting GJ-01-XX-9999 ensures exact compliance for regional permit checkposts.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0052ff] hover:bg-[#003ec7] text-white font-bold rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              {loading ? "Saving Asset..." : "Save Vehicle"}
            </button>
            <Link
              href="/vehicles"
              className="w-full py-2.5 bg-white border border-[#c3c5d9] text-[#191b25] text-center font-semibold rounded-xl hover:bg-gray-50 transition-all block text-sm"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
