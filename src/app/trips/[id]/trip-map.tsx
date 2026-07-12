"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function TripMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Seattle: [47.6062, -122.3321]
    // Chicago: [41.8781, -87.6298]
    // Missoula: [46.8721, -113.9940]
    const mundra: [number, number] = [22.84, 69.70];
    const ahmedabad: [number, number] = [23.03, 72.58];
    const surendranagar: [number, number] = [22.75, 71.63];

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [22.9, 71.1], // Centered in Gujarat
      zoom: 8,
      zoomControl: false,
    });

    // Add high-contrast minimalist tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    // Zoom controls at bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    // Draw route path: Solid blue from Mundra to Surendranagar, dashed blue from Surendranagar to Ahmedabad
    L.polyline([mundra, surendranagar], {
      color: "#0052ff",
      weight: 4,
      opacity: 0.9,
    }).addTo(map);

    L.polyline([surendranagar, ahmedabad], {
      color: "#0052ff",
      weight: 4,
      opacity: 0.6,
      dashArray: "6, 8",
    }).addTo(map);

    // Origin Marker (Mundra Port)
    const mundraIcon = L.divIcon({
      className: "custom-div-icon",
      html: `
        <div class="flex flex-col items-center">
          <div class="w-4 h-4 bg-white border-4 border-[#0052ff] rounded-full shadow-lg"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker(mundra, { icon: mundraIcon })
      .addTo(map)
      .bindPopup("<b>Origin:</b> Mundra Port");

    // Destination Marker (Ahmedabad Hub)
    const ahmedabadIcon = L.divIcon({
      className: "custom-div-icon",
      html: `
        <div class="flex flex-col items-center">
          <div class="w-4 h-4 bg-white border-4 border-[#10b981] rounded-full shadow-lg"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker(ahmedabad, { icon: ahmedabadIcon })
      .addTo(map)
      .bindPopup("<b>Destination:</b> Ahmedabad Hub");

    // Current Location Marker (Surendranagar)
    const vehicleIcon = L.divIcon({
      className: "custom-div-icon",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-[#0052ff]/20 rounded-full animate-ping"></div>
          <div class="w-6 h-6 bg-[#0052ff] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
            <span class="material-symbols-outlined text-[13px]" style="font-variation-settings: 'FILL' 1;">local_shipping</span>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker(surendranagar, { icon: vehicleIcon })
      .addTo(map)
      .bindPopup("<b>Current Location:</b> Near Surendranagar, Gujarat (NH-47)");

    // Fit map bounds to show the entire route with padding
    map.fitBounds(L.latLngBounds([mundra, ahmedabad]), {
      padding: [40, 40],
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[380px] rounded-xl" />;
}
