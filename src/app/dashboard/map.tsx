"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface TripData {
  id: string;
  source: string;
  destination: string;
  status: string;
  vehicle: {
    registrationNumber: string;
    type: string;
  };
  driver: {
    name: string;
  };
}

interface FleetMapProps {
  activeTrips: TripData[];
}

const CITY_COORDS: Record<string, [number, number]> = {
  "Ahmedabad, GJ": [23.0225, 72.5714],
  "Surat, GJ": [21.1702, 72.8311],
  "Vadodara, GJ": [22.3072, 73.1812],
  "Rajkot, GJ": [22.3039, 70.8022],
  "Gandhinagar, GJ": [23.2156, 72.6369],
  "Jamnagar, GJ": [22.4707, 70.0577],
  "Bhavnagar, GJ": [21.7645, 72.1519],
  "Bhuj, GJ": [23.2420, 69.6669],
};

export default function FleetMap({ activeTrips }: FleetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on Gujarat, India
    const map = L.map(mapContainerRef.current, {
      center: [22.2587, 71.1924],
      zoom: 7,
      zoomControl: false,
    });

    // Add high-contrast minimalist tile layer (CartoDB Positron)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    // Add zoom control at bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers and lines
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    if (activeTrips.length === 0) return;

    const bounds: L.LatLngExpression[] = [];

    activeTrips.forEach((trip) => {
      const startCoords = CITY_COORDS[trip.source];
      const endCoords = CITY_COORDS[trip.destination];

      if (!startCoords || !endCoords) return;

      bounds.push(startCoords);
      bounds.push(endCoords);

      // 1. Draw route line (Polyline)
      L.polyline([startCoords, endCoords], {
        color: "#0052ff",
        weight: 3,
        opacity: 0.7,
        dashArray: "5, 10",
      }).addTo(map);

      // 2. Add source marker (glowing blue dot)
      const sourceIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="w-3 h-3 bg-blue-500 rounded-full border border-white shadow"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      L.marker(startCoords, { icon: sourceIcon })
        .addTo(map)
        .bindPopup(`<b>Origin:</b> ${trip.source}`);

      // 3. Add destination marker (glowing green dot)
      const destIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="w-3 h-3 bg-green-500 rounded-full border border-white shadow"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      L.marker(endCoords, { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>Destination:</b> ${trip.destination}`);

      // 4. Calculate midpoint for active vehicle animation
      const latMid = (startCoords[0] + endCoords[0]) / 2;
      const lngMid = (startCoords[1] + endCoords[1]) / 2;
      const vehicleCoords: [number, number] = [latMid, lngMid];

      // 5. Add active vehicle marker (custom truck icon with pulse)
      const vehicleIcon = L.divIcon({
        className: "custom-div-icon",
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-6 h-6 bg-[#0052ff]/20 rounded-full animate-ping"></div>
            <div class="w-4 h-4 bg-[#0052ff] rounded-full border-2 border-white shadow-md flex items-center justify-center text-white">
              <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">local_shipping</span>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker(vehicleCoords, { icon: vehicleIcon })
        .addTo(map)
        .bindPopup(`
          <div class="text-xs p-1">
            <b class="text-[#0052ff]">${trip.vehicle.registrationNumber}</b><br/>
            <b>Driver:</b> ${trip.driver.name}<br/>
            <b>Route:</b> ${trip.source} → ${trip.destination}
          </div>
        `);
    });

    // Fit map bounds to show all active routes
    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
    }
  }, [activeTrips]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />;
}
