"use client";

import React, { useState } from "react";

interface ChartItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface FleetChartsProps {
  chartData: ChartItem[];
}

export function FleetCharts({ chartData }: FleetChartsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  // SVG calculations for Donut Chart
  let accumulatedAngle = 0;
  const radius = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Donut Chart Visual */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {total === 0 ? (
          <div className="w-40 h-40 rounded-full border-[12px] border-gray-100 flex items-center justify-center text-center">
            <span className="text-xs text-[#505f76] font-medium">No active<br />vehicles</span>
          </div>
        ) : (
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150">
            {chartData.map((item, index) => {
              if (item.value === 0) return null;
              
              const angle = (item.value / total) * 360;
              const strokeDashoffset = circumference - (item.value / total) * circumference;
              const rotation = accumulatedAngle;
              accumulatedAngle += angle;

              const isHovered = hoveredIndex === index;

              return (
                <circle
                  key={item.name}
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${rotation} 75 75)`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="transition-all duration-200 cursor-pointer"
                />
              );
            })}
          </svg>
        )}

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="text-3xl font-extrabold text-[#191b25]">
            {hoveredIndex !== null ? chartData[hoveredIndex].value : total}
          </span>
          <p className="text-xs text-[#505f76] font-medium uppercase tracking-wider">
            {hoveredIndex !== null ? chartData[hoveredIndex].name : "Vehicles"}
          </p>
        </div>
      </div>

      {/* Legend list */}
      <div className="mt-6 w-full space-y-2.5">
        {chartData.map((item, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={item.name}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-2 rounded-lg transition-all duration-150 cursor-pointer ${
                isHovered ? "bg-[#0052ff]/5 scale-[1.01]" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-[#191b25]">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#505f76] font-semibold">{item.value} units</span>
                <span className="text-sm font-bold text-[#191b25] w-10 text-right">{item.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
