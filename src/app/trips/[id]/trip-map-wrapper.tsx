"use client";

import dynamic from "next/dynamic";
import React from "react";

const TripMap = dynamic(() => import("./trip-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 text-[#505f76] text-sm font-medium rounded-xl">
      <div className="flex flex-col items-center gap-2">
        <span className="material-symbols-outlined animate-spin text-2xl text-[#0052ff]">progress_activity</span>
        Loading route map...
      </div>
    </div>
  ),
});

export default TripMap;
