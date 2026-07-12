"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const driverFormSchema = z.object({
  employee_code: z
    .string()
    .min(3, "Employee code must be at least 3 characters")
    .max(20, "Employee code must be under 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Must contain only uppercase alphanumeric characters or hyphens"),
  full_name: z.string().min(1, "Full name is required"),
  contact_number: z
    .string()
    .min(10, "Contact number must be at least 10 digits")
    .regex(/^[+0-9\s-]+$/, "Invalid phone number format"),
  license_number: z
    .string()
    .min(5, "License number must be at least 5 characters")
    .regex(/^[A-Z0-9-/ ]+$/i, "Invalid license number format"),
  license_category: z.string().min(1, "License category is required"),
  license_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid expiry date"),
  joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid joining date"),
  safety_score: z.coerce
    .number()
    .int()
    .min(0, "Safety score cannot be negative")
    .max(100, "Safety score cannot exceed 100")
    .default(100),
  status: z.enum(["available", "on_trip", "off_duty", "suspended"]).default("available"),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

export default function NewDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      employee_code: "",
      full_name: "",
      contact_number: "",
      license_number: "",
      license_category: "Commercial Heavy License (HMV)",
      license_expiry: new Date(Date.now() + 86400000 * 365).toISOString().split("T")[0],
      joining_date: new Date().toISOString().split("T")[0],
      safety_score: 100,
      status: "available",
    },
  });

  const onSubmit = async (data: DriverFormValues) => {
    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to onboard driver");
      }

      router.push("/drivers");
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
        <Link href="/drivers" className="hover:text-[#0052ff] flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Drivers
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191b25] font-bold">Onboard Driver</span>
      </div>

      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-[#191b25]">Onboard operator</h2>
        <p className="text-sm text-[#505f76]">
          Register a new driver profile with compliance details and contact information.
        </p>
      </div>

      {serverError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
          {serverError}
        </div>
      )}

      {/* Form Bento Layout */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Specs - 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Identity & Contact */}
          <div className="bg-white border border-[#e1e1ef] p-6 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center gap-3 pb-2 border-b border-[#e1e1ef]">
              <div className="w-10 h-10 rounded-lg bg-[#f3f2ff] flex items-center justify-center text-[#0052ff]">
                <span className="material-symbols-outlined">person</span>
              </div>
              <h3 className="text-lg font-bold text-[#191b25]">Profile Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="full_name">
                  Full Name
                </label>
                <input
                  id="full_name"
                  placeholder="e.g. Ramesh Kumar"
                  {...register("full_name")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.full_name && (
                  <p className="text-xs font-medium text-red-600">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="employee_code">
                  Employee Code / ID
                </label>
                <input
                  id="employee_code"
                  placeholder="e.g. EMP-902"
                  {...register("employee_code")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none uppercase"
                />
                {errors.employee_code && (
                  <p className="text-xs font-medium text-red-600">{errors.employee_code.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="contact_number">
                  Contact Number
                </label>
                <input
                  id="contact_number"
                  placeholder="e.g. +91 9876543210"
                  {...register("contact_number")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.contact_number && (
                  <p className="text-xs font-medium text-red-600">{errors.contact_number.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="joining_date">
                  Joining Date
                </label>
                <input
                  id="joining_date"
                  type="date"
                  {...register("joining_date")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.joining_date && (
                  <p className="text-xs font-medium text-red-600">{errors.joining_date.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Compliance & License */}
          <div className="bg-white border border-[#e1e1ef] p-6 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center gap-3 pb-2 border-b border-[#e1e1ef]">
              <div className="w-10 h-10 rounded-lg bg-[#f3f2ff] flex items-center justify-center text-[#0052ff]">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <h3 className="text-lg font-bold text-[#191b25]">Licensing &amp; Compliance</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="license_number">
                  License Number
                </label>
                <input
                  id="license_number"
                  placeholder="e.g. GJ01 20200012345"
                  {...register("license_number")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.license_number && (
                  <p className="text-xs font-medium text-red-600">{errors.license_number.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="license_category">
                  License Class / Category
                </label>
                <input
                  id="license_category"
                  placeholder="e.g. Commercial Heavy Vehicle (HMV)"
                  {...register("license_category")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.license_category && (
                  <p className="text-xs font-medium text-red-600">{errors.license_category.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="license_expiry">
                  License Expiry Date
                </label>
                <input
                  id="license_expiry"
                  type="date"
                  {...register("license_expiry")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.license_expiry && (
                  <p className="text-xs font-medium text-red-600">{errors.license_expiry.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#505f76] uppercase tracking-wider block" htmlFor="safety_score">
                  Initial Safety Score (0 - 100)
                </label>
                <input
                  id="safety_score"
                  type="number"
                  placeholder="100"
                  {...register("safety_score")}
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] transition-all outline-none"
                />
                {errors.safety_score && (
                  <p className="text-xs font-medium text-red-600">{errors.safety_score.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Side Panel - 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Avatar upload */}
          <div className="bg-white border border-[#e1e1ef] p-6 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-[#191b25]">Operator Photo</h3>
            <div className="w-full aspect-square rounded-lg border-2 border-dashed border-[#c3c5d9] bg-[#f3f2ff]/30 flex flex-col items-center justify-center text-center p-4">
              <span className="material-symbols-outlined text-[48px] text-[#737688] mb-1">account_circle</span>
              <p className="text-xs font-bold text-[#191b25]">Upload Avatar Photo</p>
              <p className="text-[10px] text-[#505f76] mt-0.5">Mocked: upload bypassed for hackathon</p>
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
              {loading ? "Onboarding..." : "Onboard Driver"}
            </button>
            <Link
              href="/drivers"
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
