import React from "react";
import TripMapWrapper from "./trip-map-wrapper";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailsPage({ params }: PageProps) {
  const { id } = await params;

  // Attempt to query details from the database if this trip happens to exist,
  // otherwise fallback to the exact mock data specified in the user request.
  let dbTrip = null;
  try {
    dbTrip = await prisma.trip.findFirst({
      where: { id },
      include: { vehicle: true, driver: true },
    });
  } catch (error) {
    console.error("Database query failed, falling back to mock data:", error);
  }

  // Data mapping with fallbacks to ensure pixel-perfect rendering of TRP-882910 details
  const tripDetails = {
    id: dbTrip?.id || "TRP-882910",
    status: dbTrip?.status || "In Transit",
    source: dbTrip?.source || "Seattle Port",
    destination: dbTrip?.destination || "Chicago Hub",
    description: dbTrip?.notes || "Deep-sea cargo haulage from Seattle Port to Chicago Hub",
    vehicleName: dbTrip?.vehicle?.model ? `${dbTrip.vehicle.make} ${dbTrip.vehicle.model}` : "Peterbilt 579 Platinum",
    assetId: dbTrip?.vehicle?.registrationNumber || "VH-0912",
    plate: "B92-XKL", // Plate number in reference
    fuelLevel: "65%", // Fuel level in reference
    driverName: dbTrip?.driver?.name || "Marcus Chen",
    driverExp: "Exp: 12 Years",
    driverClass: "Heavy Duty Class A",
    driverRating: "4.9",
    driverTrips: "248 Trips",
    payloadWeight: "24,500 lbs",
    payloadCapacity: "45,000 lbs",
    maintenanceDue: "1,240 mi",
    distance: "2,058 mi",
    speed: "62 mph",
    fuelConsumed: "142 gal",
    stops: "02 / 05",
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#191b25] tracking-tight">
              Trip ID: {tripDetails.id}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0052ff] border border-blue-100 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0052ff] animate-ping"></span>
              {tripDetails.status}
            </span>
          </div>
          <p className="text-[#505f76] text-sm mt-1">{tripDetails.description}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-[#c3c5d9] hover:bg-[#f3f2ff]/30 active:bg-[#f3f2ff]/65 text-[#505f76] hover:text-[#191b25] font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Manifest
          </button>
          <button className="px-4 py-2 bg-[#0052ff] hover:bg-[#003ec7] active:bg-[#002eb0] text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Trip
          </button>
        </div>
      </div>

      {/* Main Grid: Left content area and Right information panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Tracking Map Card */}
          <div className="bg-white rounded-2xl border border-[#e1e1ef] shadow-sm overflow-hidden flex flex-col">
            {/* Map Card Header */}
            <div className="p-4 border-b border-[#e1e1ef] flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0052ff]">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    place
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[#737688] font-bold uppercase tracking-wider leading-none">Origin</p>
                  <h4 className="text-sm font-bold text-[#191b25] mt-0.5">{tripDetails.source}</h4>
                </div>
              </div>

              {/* Progress Connector Indicator */}
              <div className="flex-1 px-8 hidden md:flex items-center">
                <div className="w-full h-0.5 bg-slate-100 relative flex items-center justify-between border-t border-dashed border-[#c3c5d9]">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#0052ff] border-2 border-white shadow"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-white shadow"></div>
                  {/* Miniature truck moving on route */}
                  <div className="absolute left-[38%] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-50 border border-[#0052ff]/30 flex items-center justify-center text-[#0052ff] shadow-sm">
                    <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-[10px] text-[#737688] font-bold uppercase tracking-wider leading-none">Destination</p>
                  <h4 className="text-sm font-bold text-[#191b25] mt-0.5">{tripDetails.destination}</h4>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-[#10b981]">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    sports_score
                  </span>
                </div>
              </div>
            </div>

            {/* Map Canvas with Floating Current Location Overlay */}
            <div className="relative w-full h-[380px] bg-slate-50">
              <TripMapWrapper />

              {/* Overlay location card */}
              <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur border border-[#e1e1ef] rounded-xl p-4 shadow-lg max-w-xs transition-all hover:bg-white">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0052ff]"></span>
                  </span>
                  <span className="text-[10px] font-extrabold text-[#0052ff] uppercase tracking-widest">
                    CURRENT LOCATION
                  </span>
                </div>
                <h5 className="text-xs font-bold text-[#191b25]">Interstate 90</h5>
                <p className="text-xs text-[#505f76]">Near Missoula, MT</p>
              </div>
            </div>

            {/* Map Card Stats Summary Footer */}
            <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#e1e1ef] border-t border-[#e1e1ef] bg-white text-center">
              <div className="p-3.5">
                <p className="text-[9px] text-[#737688] font-bold uppercase tracking-widest">Total Distance</p>
                <p className="text-sm font-extrabold text-[#191b25] mt-0.5">{tripDetails.distance}</p>
              </div>
              <div className="p-3.5">
                <p className="text-[9px] text-[#737688] font-bold uppercase tracking-widest">Est. Duration</p>
                <p className="text-sm font-extrabold text-[#191b25] mt-0.5">34 Hrs 15 Min</p>
              </div>
              <div className="p-3.5">
                <p className="text-[9px] text-[#737688] font-bold uppercase tracking-widest">Vehicle</p>
                <p className="text-sm font-bold text-[#0052ff] hover:underline mt-0.5 cursor-pointer truncate px-1">
                  {tripDetails.vehicleName}
                </p>
              </div>
              <div className="p-3.5">
                <p className="text-[9px] text-[#737688] font-bold uppercase tracking-widest">Status</p>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0052ff] mt-0.5 border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0052ff]"></span>
                  Active
                </div>
              </div>
              <div className="p-3.5 col-span-2 md:col-span-1">
                <p className="text-[9px] text-[#737688] font-bold uppercase tracking-widest">Next Stop</p>
                <p className="text-sm font-extrabold text-[#191b25] mt-0.5 truncate px-1">Bozeman Checkpoint, MT</p>
              </div>
            </div>
          </div>

          {/* Trip Timeline Card */}
          <div className="bg-white rounded-2xl border border-[#e1e1ef] shadow-sm p-6 flex flex-col">
            <h3 className="text-base font-bold text-[#191b25] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0052ff]" style={{ fontVariationSettings: "'FILL' 1" }}>
                route
              </span>
              Trip Timeline
            </h3>

            {/* Vertical Timeline */}
            <div className="relative pl-8 border-l-2 border-[#e1e1ef] space-y-8 pb-2 ml-3">
              {/* Event 1 */}
              <div className="relative">
                <span className="absolute -left-[45px] top-0 w-6 h-6 bg-blue-50 border-2 border-[#0052ff] rounded-full flex items-center justify-center text-[#0052ff] text-xs">
                  <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                </span>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <h4 className="text-sm font-bold text-[#191b25]">Dispatched</h4>
                    <p className="text-xs text-[#505f76] mt-0.5">Seattle Operations Center • Unit 04</p>
                  </div>
                  <p className="text-xs text-[#737688] font-medium sm:text-right">Jul 10, 08:30 AM</p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <span className="absolute -left-[45px] top-0 w-6 h-6 bg-blue-50 border-2 border-[#0052ff] rounded-full flex items-center justify-center text-[#0052ff] text-xs">
                  <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                </span>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <h4 className="text-sm font-bold text-[#191b25]">Arrived at Source</h4>
                    <p className="text-xs text-[#505f76] mt-0.5">Port of Seattle, Pier 91</p>
                  </div>
                  <p className="text-xs text-[#737688] font-medium sm:text-right">Jul 10, 10:15 AM</p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative">
                <span className="absolute -left-[45px] top-0 w-6 h-6 bg-blue-50 border-2 border-[#0052ff] rounded-full flex items-center justify-center text-[#0052ff] text-xs">
                  <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                </span>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <h4 className="text-sm font-bold text-[#191b25]">Loaded</h4>
                    <p className="text-xs text-[#505f76] mt-0.5">24.5 Tons of Industrial Components</p>
                  </div>
                  <p className="text-xs text-[#737688] font-medium sm:text-right">Jul 10, 12:45 PM</p>
                </div>
              </div>

              {/* Event 4 (Active Step) */}
              <div className="relative">
                <div className="absolute -left-[49px] top-0.5 w-8 h-8 flex items-center justify-center z-10">
                  <span className="absolute w-6 h-6 bg-[#0052ff]/15 rounded-full animate-ping"></span>
                  <span className="relative w-4 h-4 bg-[#0052ff] border-2 border-white rounded-full shadow"></span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 bg-blue-50/40 p-3 rounded-xl border border-blue-100 -mx-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-[#0052ff]">In Transit</h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-[#0052ff] text-white uppercase tracking-wider">
                        Currently Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-bold mt-1 leading-snug">
                      Heading Eastbound on I-90 • Estimated 450 miles to next checkpoint
                    </p>
                  </div>
                  <p className="text-xs text-[#0052ff] font-bold sm:text-right shrink-0">Jul 12, 02:15 PM</p>
                </div>
              </div>

              {/* Event 5 (Future/Inactive) */}
              <div className="relative">
                <span className="absolute -left-[45px] top-1 w-6 h-6 bg-slate-50 border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-400">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                </span>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 opacity-60">
                  <div>
                    <h4 className="text-sm font-semibold text-[#505f76]">Delivered</h4>
                    <p className="text-xs text-[#505f76] mt-0.5">Chicago Distribution Hub (Expected)</p>
                  </div>
                  <p className="text-xs text-[#737688] font-medium sm:text-right">Jul 13, 06:30 PM</p>
                </div>
              </div>
            </div>

            {/* Dispatcher activity & Actions row */}
            <div className="mt-8 pt-6 border-t border-[#e1e1ef] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                {/* Stacked avatars */}
                <div className="flex -space-x-2">
                  <img
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                    alt="Sarah Connor"
                  />
                  <img
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                    alt="James Wilson"
                  />
                  <img
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow"
                    src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=100"
                    alt="Robert Fox"
                  />
                </div>
                <p className="text-xs text-[#505f76] font-semibold">3 Dispatchers monitoring this trip</p>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 text-xs font-bold text-[#505f76] hover:text-[#191b25] bg-white border border-[#c3c5d9] hover:bg-[#ededfb] active:bg-[#f3f2ff]/65 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  Export Logs
                </button>
                <button className="px-4 py-2 text-xs font-bold text-white bg-[#ef4444] hover:bg-[#dc2626] active:bg-[#b91c1c] rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">dangerous</span>
                  Emergency Halt
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Assigned Driver Card */}
          <div className="bg-white rounded-2xl border border-[#e1e1ef] shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-[#737688] uppercase tracking-wider">Assigned Driver</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-green-50 text-[#10b981] border border-[#10b981]/25">
                VERIFIED
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                className="w-14 h-14 rounded-full border border-[#e1e1ef] object-cover shadow-sm"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt={tripDetails.driverName}
              />
              <div className="flex-1 overflow-hidden">
                <h4 className="font-extrabold text-[#191b25] text-base truncate">{tripDetails.driverName}</h4>
                <div className="flex items-center gap-1.5 text-xs text-[#505f76] font-medium mt-0.5">
                  <span>{tripDetails.driverExp}</span>
                  <span className="text-[#c3c5d9] font-normal">•</span>
                  <span className="truncate">{tripDetails.driverClass}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-bold">
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span>{tripDetails.driverRating}</span>
                  <span className="text-[#737688] font-semibold">({tripDetails.driverTrips})</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="py-2 px-3 text-xs font-bold text-[#0052ff] bg-[#0052ff]/5 hover:bg-[#0052ff]/10 active:bg-[#0052ff]/25 rounded-lg transition-all flex items-center justify-center gap-1.5 border border-[#0052ff]/10 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">phone</span>
                Call
              </button>
              <button className="py-2 px-3 text-xs font-bold text-[#505f76] hover:text-[#191b25] bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-all flex items-center justify-center gap-1.5 border border-[#c3c5d9]/60 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                Message
              </button>
            </div>
          </div>

          {/* Assigned Vehicle Card */}
          <div className="bg-white rounded-2xl border border-[#e1e1ef] shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-[#737688] uppercase tracking-wider">Assigned Vehicle</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-green-50 text-[#10b981] border border-[#10b981]/25">
                HEALTHY
              </span>
            </div>

            <div className="flex items-center gap-3.5 mb-4 border-b border-[#e1e1ef]/40 pb-3">
              <div className="w-11 h-11 rounded-xl bg-slate-50 border border-[#e1e1ef] flex items-center justify-center text-[#505f76] shrink-0">
                <span className="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-extrabold text-[#191b25] text-sm truncate">{tripDetails.vehicleName}</h4>
                <div className="flex items-center gap-2 text-xs text-[#505f76] font-medium mt-0.5">
                  <span className="truncate">Asset: {tripDetails.assetId}</span>
                  <span className="text-[#c3c5d9] font-normal">•</span>
                  <span className="shrink-0">Plate: {tripDetails.plate}</span>
                </div>
              </div>
            </div>

            {/* Capacity & Maintenance Indicators */}
            <div className="space-y-4">
              {/* Payload Weight */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#505f76]">Payload Capacity</span>
                  <span className="text-[#191b25] font-bold">{tripDetails.payloadWeight} / {tripDetails.payloadCapacity}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-[#0052ff] h-full rounded-full" style={{ width: "54.4%" }}></div>
                </div>
              </div>

              {/* Maintenance Progress */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#505f76]">Maintenance Due</span>
                  <span className="text-[#191b25] font-bold">{tripDetails.maintenanceDue} remaining</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "68%" }}></div>
                </div>
              </div>

              {/* Fuel Level */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#505f76]">Fuel Level</span>
                  <span className="text-[#10b981] font-bold">{tripDetails.fuelLevel}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-[#10b981] h-full rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Distance Card */}
            <div className="bg-white rounded-2xl border border-[#e1e1ef] shadow-sm p-4 flex flex-col">
              <span className="material-symbols-outlined text-[#0052ff] mb-3 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                route
              </span>
              <p className="text-[10px] font-bold text-[#737688] uppercase tracking-wider">Total Distance</p>
              <p className="text-lg font-extrabold text-[#191b25] mt-1">{tripDetails.distance}</p>
            </div>

            {/* Speed Card */}
            <div className="bg-white rounded-2xl border border-[#e1e1ef] shadow-sm p-4 flex flex-col">
              <span className="material-symbols-outlined text-[#10b981] mb-3 text-lg">
                speed
              </span>
              <p className="text-[10px] font-bold text-[#737688] uppercase tracking-wider">Current Speed</p>
              <p className="text-lg font-extrabold text-[#191b25] mt-1">{tripDetails.speed}</p>
            </div>

            {/* Fuel Card */}
            <div className="bg-white rounded-2xl border border-[#e1e1ef] shadow-sm p-4 flex flex-col">
              <span className="material-symbols-outlined text-red-500 mb-3 text-lg">
                local_gas_station
              </span>
              <p className="text-[10px] font-bold text-[#737688] uppercase tracking-wider">Fuel Consumed</p>
              <p className="text-lg font-extrabold text-[#191b25] mt-1">{tripDetails.fuelConsumed}</p>
            </div>

            {/* Rest Stops Card */}
            <div className="bg-white rounded-2xl border border-[#e1e1ef] shadow-sm p-4 flex flex-col">
              <span className="material-symbols-outlined text-amber-500 mb-3 text-lg">
                hotel
              </span>
              <p className="text-[10px] font-bold text-[#737688] uppercase tracking-wider">Rest Stops</p>
              <p className="text-lg font-extrabold text-[#191b25] mt-1">{tripDetails.stops}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
