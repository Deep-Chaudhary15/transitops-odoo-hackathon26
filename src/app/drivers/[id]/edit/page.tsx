// src/app/drivers/[id]/edit/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { driverService } from "@/services/driver.service";
import { EditDriverForm } from "./edit-form";

interface EditDriverPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditDriverPage({ params }: EditDriverPageProps) {
  const { id } = await params;

  let driver = null;
  try {
    driver = await driverService.getById(id);
  } catch (error) {
    console.error("Error loading driver from Supabase:", error);
  }

  if (!driver) {
    notFound();
  }

  // Format expiry dates and numbers to safe formats for serialisation
  const serializedDriver = {
    id: driver.id,
    profile_id: driver.profile_id,
    employee_code: driver.employee_code,
    full_name: driver.full_name,
    contact_number: driver.contact_number,
    license_number: driver.license_number,
    license_category: driver.license_category,
    license_expiry: driver.license_expiry,
    joining_date: driver.joining_date,
    safety_score: Number(driver.safety_score),
    status: driver.status as "available" | "on_trip" | "off_duty" | "suspended",
  };

  return <EditDriverForm driver={serializedDriver} />;
}
