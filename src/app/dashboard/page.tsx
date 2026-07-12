import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, VehicleType } from "@prisma/client";

// Recharts is a client component library, we will create a client component for charts to load inside this page.
import { FleetCharts } from "./fleet-charts";

interface DashboardPageProps {
  searchParams: Promise<{
    region?: string;
    type?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const filterRegion = params.region || undefined;
  const filterType = params.type as VehicleType || undefined;

  // Build filter object for Vehicles
  const vehicleFilter: any = {};
  if (filterRegion) vehicleFilter.region = filterRegion;
  if (filterType) vehicleFilter.type = filterType;

  // 1. Fetch KPI metrics dynamically
  const totalVehiclesCount = await prisma.vehicle.count({
    where: vehicleFilter,
  });

  const activeTripsCount = await prisma.trip.count({
    where: {
      status: TripStatus.ACTIVE,
      vehicle: vehicleFilter,
    },
  });

  const availableDriversCount = await prisma.driver.count({
    where: {
      status: DriverStatus.AVAILABLE,
    },
  });

  const maintenanceAlertsCount = await prisma.maintenance.count({
    where: {
      status: {
        in: [MaintenanceStatus.OPEN, MaintenanceStatus.IN_PROGRESS],
      },
      vehicle: vehicleFilter,
    },
  });

  // 2. Fetch Vehicle Status distribution for chart
  const availableVehiclesCount = await prisma.vehicle.count({
    where: { ...vehicleFilter, status: VehicleStatus.AVAILABLE },
  });
  const onTripVehiclesCount = await prisma.vehicle.count({
    where: { ...vehicleFilter, status: VehicleStatus.ON_TRIP },
  });
  const inShopVehiclesCount = await prisma.vehicle.count({
    where: { ...vehicleFilter, status: VehicleStatus.IN_SHOP },
  });
  const decommissionedVehiclesCount = await prisma.vehicle.count({
    where: { ...vehicleFilter, status: VehicleStatus.DECOMMISSIONED },
  });

  const totalFilteredVehicles = availableVehiclesCount + onTripVehiclesCount + inShopVehiclesCount + decommissionedVehiclesCount;

  const chartData = [
    { name: "Available", value: availableVehiclesCount, percentage: totalFilteredVehicles > 0 ? Math.round((availableVehiclesCount / totalFilteredVehicles) * 100) : 0, color: "#10b981" },
    { name: "On Route", value: onTripVehiclesCount, percentage: totalFilteredVehicles > 0 ? Math.round((onTripVehiclesCount / totalFilteredVehicles) * 100) : 0, color: "#0052ff" },
    { name: "Maintenance", value: inShopVehiclesCount, percentage: totalFilteredVehicles > 0 ? Math.round((inShopVehiclesCount / totalFilteredVehicles) * 100) : 0, color: "#f59e0b" },
    { name: "Decommissioned", value: decommissionedVehiclesCount, percentage: totalFilteredVehicles > 0 ? Math.round((decommissionedVehiclesCount / totalFilteredVehicles) * 100) : 0, color: "#ef4444" },
  ];

  // 3. Fetch Recent Trips with relations
  const recentTrips = await prisma.trip.findMany({
    where: {
      vehicle: vehicleFilter,
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      vehicle: true,
      driver: true,
    },
  });

  // Get distinct regions for filter dropdown
  const distinctRegions = await prisma.vehicle.findMany({
    select: { region: true },
    distinct: ["region"],
    where: { region: { not: null } },
  });
  const regions = distinctRegions.map((r) => r.region).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#191b25]">Fleet Overview</h2>
          <p className="text-sm text-[#505f76]">Real-time operational status for your logistics network.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Filters */}
          <form className="flex items-center gap-2" method="GET">
            <select
              name="region"
              defaultValue={filterRegion || ""}
              className="bg-white border border-[#c3c5d9] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] outline-none"
            >
              <option value="">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              name="type"
              defaultValue={filterType || ""}
              className="bg-white border border-[#c3c5d9] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] outline-none animate-none"
            >
              <option value="">All Types</option>
              {Object.values(VehicleType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <button
              type="submit"
              className="px-3 py-1.5 bg-[#ededfb] text-[#003ec7] font-semibold rounded-lg text-sm hover:bg-[#0052ff]/10 transition-all cursor-pointer"
            >
              Apply Filter
            </button>
          </form>

          <Link
            href="/trips"
            className="flex items-center gap-2 px-4 py-2 bg-[#0052ff] text-white rounded-lg text-sm font-semibold hover:bg-[#003ec7] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Dispatch
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Fleet */}
        <div className="bg-white border border-[#e1e1ef] p-5 rounded-xl flex flex-col justify-between hover:shadow-md transition-all group hover:border-[#0052ff]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#ededfb] flex items-center justify-center text-[#0052ff]">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">+2.4%</span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-[#505f76] font-medium uppercase tracking-wider">Total Fleet</p>
            <h3 className="text-3xl font-extrabold text-[#191b25] mt-1">{totalVehiclesCount}</h3>
          </div>
        </div>

        {/* Active Trips */}
        <div className="bg-white border border-[#e1e1ef] p-5 rounded-xl flex flex-col justify-between hover:shadow-md transition-all group hover:border-[#0052ff]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#ededfb] flex items-center justify-center text-[#0052ff]">
              <span className="material-symbols-outlined">route</span>
            </div>
            <span className="text-xs text-[#003ec7] font-bold bg-[#0052ff]/10 px-2 py-0.5 rounded-full">Active Routes</span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-[#505f76] font-medium uppercase tracking-wider">Active Trips</p>
            <h3 className="text-3xl font-extrabold text-[#191b25] mt-1">{activeTripsCount}</h3>
          </div>
        </div>

        {/* Available Drivers */}
        <div className="bg-white border border-[#e1e1ef] p-5 rounded-xl flex flex-col justify-between hover:shadow-md transition-all group hover:border-[#0052ff]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#ededfb] flex items-center justify-center text-[#0052ff]">
              <span className="material-symbols-outlined">person</span>
            </div>
            <span className="text-xs text-[#505f76] font-semibold bg-[#f3f2ff] px-2 py-0.5 rounded-full">On Duty</span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-[#505f76] font-medium uppercase tracking-wider">Available Drivers</p>
            <h3 className="text-3xl font-extrabold text-[#191b25] mt-1">{availableDriversCount}</h3>
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className="bg-white border border-[#e1e1ef] p-5 rounded-xl flex flex-col justify-between hover:shadow-md transition-all group hover:border-[#0052ff]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#ef4444]">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">High Priority</span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-[#505f76] font-medium uppercase tracking-wider">Maintenance Alerts</p>
            <h3 className="text-3xl font-extrabold text-[#191b25] mt-1">{maintenanceAlertsCount}</h3>
          </div>
        </div>
      </div>

      {/* Middle Row: Donut Chart & Live Dispatch Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fleet Status Donut Chart Card */}
        <div className="lg:col-span-4 bg-white border border-[#e1e1ef] p-6 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-[#191b25]">Fleet Status</h4>
            <span className="text-xs text-[#505f76] font-medium">Total: {totalFilteredVehicles}</span>
          </div>
          
          {/* Interactive Chart Component */}
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <FleetCharts chartData={chartData} />
          </div>
        </div>

        {/* Live Dispatch Map */}
        <div className="lg:col-span-8 bg-white border border-[#e1e1ef] rounded-xl overflow-hidden flex flex-col relative group min-h-[400px]">
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white/90 backdrop-blur-md border border-[#e1e1ef] p-3 rounded-lg shadow-sm">
              <h4 className="text-sm font-bold text-[#191b25]">Live Dispatch Map</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-[#505f76]">{activeTripsCount} Active Routes Tracking</span>
              </div>
            </div>
          </div>
          {/* Map Simulation */}
          <div className="flex-1 bg-[#ededfb] relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0052ff_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
            <img
              className="w-full h-full object-cover select-none"
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200"
              alt="Vector Navigation Map"
            />
            {/* Map Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
              <button className="w-9 h-9 bg-white rounded-lg border border-[#e1e1ef] flex items-center justify-center text-[#191b25] hover:bg-[#f3f2ff] transition-all shadow-sm">
                <span className="material-symbols-outlined text-xl">add</span>
              </button>
              <button className="w-9 h-9 bg-white rounded-lg border border-[#e1e1ef] flex items-center justify-center text-[#191b25] hover:bg-[#f3f2ff] transition-all shadow-sm">
                <span className="material-symbols-outlined text-xl">remove</span>
              </button>
              <button className="w-9 h-9 bg-white rounded-lg border border-[#e1e1ef] flex items-center justify-center text-[#191b25] hover:bg-[#f3f2ff] transition-all shadow-sm">
                <span className="material-symbols-outlined text-xl">my_location</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Fleet Activity */}
      <div className="bg-white border border-[#e1e1ef] rounded-xl overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#e1e1ef]">
          <h4 className="text-lg font-bold text-[#191b25]">Recent Fleet Activity</h4>
          <Link
            href="/trips"
            className="text-sm font-semibold text-[#0052ff] hover:text-[#003ec7] flex items-center gap-1"
          >
            View All Dispatch
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recentTrips.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#505f76]">
              No active or recent trips found. Create a trip in the dispatcher to start tracking.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f2ff] border-b border-[#e1e1ef]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Vehicle ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Route</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Planned Distance</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#505f76] uppercase tracking-wider">Dispatched</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e1ef]">
                {recentTrips.map((trip) => {
                  let statusBg = "bg-gray-100 text-gray-700";
                  if (trip.status === TripStatus.ACTIVE) {
                    statusBg = "bg-blue-100 text-blue-700";
                  } else if (trip.status === TripStatus.COMPLETED) {
                    statusBg = "bg-green-100 text-green-700";
                  } else if (trip.status === TripStatus.CANCELLED) {
                    statusBg = "bg-red-100 text-red-700";
                  }

                  return (
                    <tr key={trip.id} className="hover:bg-[#0052ff]/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#505f76]">local_shipping</span>
                          <span className="text-sm font-semibold text-[#191b25]">{trip.vehicle.registrationNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#191b25] font-medium">{trip.driver.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#191b25] font-medium">{trip.source} → {trip.destination}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusBg}`}>
                          {trip.status === TripStatus.ACTIVE && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse mr-1.5"></div>}
                          {trip.status === TripStatus.COMPLETED && <div className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5"></div>}
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#505f76]">{trip.plannedDistance} km</td>
                      <td className="px-6 py-4 text-sm text-[#505f76]">
                        {trip.dispatchedAt ? new Date(trip.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
