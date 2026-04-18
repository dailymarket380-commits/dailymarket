'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';

// Fix for default marker icons not showing in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Modern minimalist light icons
const storeIcon = L.divIcon({
  html: `<div style="background: white; border: 3px solid #05a357; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">🛍️</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const homeIcon = L.divIcon({
  html: `<div style="background: white; border: 3px solid black; padding: 6px; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"><svg viewBox="0 0 24 24" fill="black" width="20" height="20"><path d="M12 3l8 6v12h-5v-7H9v7H4V9l8-6z"/></svg></div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Function to generate rotated sleek white Tesla icon
const getCarIcon = (heading: number) => {
  return L.divIcon({
    html: `
      <div style="transform: rotate(${heading}deg); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.4));">
        <svg viewBox="0 0 100 180" width="28" height="50">
          <rect x="12" y="25" width="12" height="30" rx="4" fill="#111" />
          <rect x="76" y="25" width="12" height="30" rx="4" fill="#111" />
          <rect x="12" y="125" width="12" height="30" rx="4" fill="#111" />
          <rect x="76" y="125" width="12" height="30" rx="4" fill="#111" />
          <path d="M 30 5 Q 50 -3 70 5 L 85 45 Q 90 90 85 135 L 75 170 Q 50 183 25 170 L 15 135 Q 10 90 15 45 Z" fill="#ffffff" stroke="#e5e7eb" stroke-width="1.5" />
          <path d="M 25 55 Q 50 40 75 55 L 78 85 Q 80 110 75 145 Q 50 135 25 145 L 22 85 Q 20 110 25 55 Z" fill="#0f172a" />
          <path d="M 22 15 L 32 10 L 35 15 L 20 25 Z" fill="#d8b4fe" />
          <path d="M 78 15 L 68 10 L 65 15 L 80 25 Z" fill="#d8b4fe" />
          <path d="M 20 165 L 35 168 L 40 173 L 22 171 Z" fill="#ef4444" />
          <path d="M 80 165 L 65 168 L 60 173 L 78 171 Z" fill="#ef4444" />
        </svg>
      </div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const START_PT: [number, number] = [-33.98438, 25.65936]; // Boardwalk Mall Gqeberha
const END_PT: [number, number] = [-33.99000, 25.66000];

function MapBounds({ route, shouldRecenter }: { route: [number, number][], shouldRecenter: number }) {
  const map = useMap();
  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { 
        paddingTopLeft: [50, 50],
        paddingBottomRight: [50, 350],
        animate: true,
        maxZoom: 16 // Don't zoom in *too* much when framing the whole route
      });
    }
  }, [map, route, shouldRecenter]);
  return null;
}

// Auto-follow logic to keep camera planted firmly over the driver
function DriverTracker({ driverPos, isAutoFollowing, setAutoFollowing }: { driverPos: [number, number], isAutoFollowing: boolean, setAutoFollowing: (val: boolean) => void }) {
  const map = useMap();

  useEffect(() => {
    if (isAutoFollowing && driverPos) {
      const zoom = 17; // High zoom, tight tracking
      // Calculate pixel offset to push the car higher on the screen 
      // so the bottom sheet doesn't overlap it.
      const targetPoint = map.project(driverPos, zoom);
      targetPoint.y += window.innerHeight * 0.25; // Shift center DOWN, car UP
      const offsetLatLng = map.unproject(targetPoint, zoom);
      map.setView(offsetLatLng, zoom, { animate: false });
    }
  }, [driverPos, isAutoFollowing, map]);

  useEffect(() => {
    const handleDrag = () => setAutoFollowing(false);
    map.on('dragstart', handleDrag);
    map.on('zoomstart', handleDrag);
    return () => { 
      map.off('dragstart', handleDrag);
      map.off('zoomstart', handleDrag); 
    }
  }, [map, setAutoFollowing]);
  return null;
}

export default function LiveMap({ 
  isActive, 
  onProgress,
  customerLocation,
  storeLocation
}: { 
  isActive: boolean;
  onProgress?: (data: { pct: number, mins: number }) => void;
  customerLocation?: [number, number];
  storeLocation?: [number, number];
}) {
  const actualStart = storeLocation || START_PT;
  const actualEnd = customerLocation || END_PT;

  const [routeLine, setRouteLine] = useState<[number, number][]>([]);
  const [driverPosition, setDriverPosition] = useState<[number, number]>(actualStart);
  const [driverHeading, setDriverHeading] = useState(135);
  const [shouldRecenter, setShouldRecenter] = useState(0);
  const [isAutoFollowing, setIsAutoFollowing] = useState(true);
  
  // To render sliced route line
  const [currentSegment, setCurrentSegment] = useState(0);

  // Fetch true street route via OSRM Open Routing API
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const locs = `${actualStart[1]},${actualStart[0]};${actualEnd[1]},${actualEnd[0]}`;
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${locs}?overview=full&geometries=geojson&alternatives=false`);
        const data = await res.json();
        
        if (data.code === 'Ok' && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
          setRouteLine(coords);
          setDriverPosition(coords[0]);
        } else {
          setRouteLine([actualStart, actualEnd]); // Fallback straight line
        }
      } catch (err) {
        console.error("OSRM Error:", err);
        setRouteLine([actualStart, actualEnd]);
      }
    };
    fetchRoute();
  }, [actualStart[0], actualStart[1], actualEnd[0], actualEnd[1]]);

  // Smoothed real-street tracing animation
  useEffect(() => {
    if (!isActive || routeLine.length === 0) return;

    let segmentIndex = 0;
    let segProgress = 0;
    
    let lastFetchedPos = [...actualStart];
    
    // 1. Fetch REAL location from drivers table (every 5 seconds)
    const fetchInterval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('drivers')
          .select('lat, lng')
          .eq('first_name', 'David')
          .limit(1)
          .single();
          
        if (data?.lat && data?.lng) {
           lastFetchedPos = [data.lat, data.lng];
        }
      } catch (err) {
        // Silently fail if db not set up
      }
    }, 5000);
    
    // 2. Smooth visual animation loop (every 80ms)
    // We update every 80ms for buttery smooth motion. 
    const animInterval = setInterval(() => {
      
      // Auto progress simulation if Supabase hasn't moved us
      segProgress += 0.06; // Move along the current segment
      
      if (segProgress >= 1) {
        segmentIndex++;
        segProgress = 0;
      }

      if (segmentIndex >= routeLine.length - 1) {
        if (!lastFetchedPos) setDriverPosition(routeLine[routeLine.length - 1]);
        clearInterval(animInterval);
        clearInterval(fetchInterval);
        return;
      }

      const p1 = routeLine[segmentIndex];
      const p2 = routeLine[segmentIndex + 1];

      // Linear interpolation on real roads
      const lat = p1[0] + (p2[0] - p1[0]) * segProgress;
      const lng = p1[1] + (p2[1] - p1[1]) * segProgress;
      
      // Compute accurate smooth vehicle heading using great circle math
      const lat1 = p1[0] * Math.PI / 180;
      const lat2 = p2[0] * Math.PI / 180;
      const dLon = (p2[1] - p1[1]) * Math.PI / 180;
      const y = Math.sin(dLon) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      
      const totalSegs = routeLine.length - 1;
      const pct = (segmentIndex + segProgress) / totalSegs;
      const minsRemaining = Math.max(0, Math.round((1 - pct) * 15));
      if (onProgress) {
        onProgress({ pct, mins: minsRemaining });
      }

      setDriverHeading(brng);
      setDriverPosition([lat, lng]);
      setCurrentSegment(segmentIndex);
    }, 80);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(animInterval);
    };
  }, [isActive, routeLine]);

  return (
    <div style={{ height: '100vh', width: '100vw', zIndex: 1, position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <MapContainer 
        center={actualStart} 
        zoom={17}
        style={{ height: '100%', width: '100%', pointerEvents: 'all' }}
        zoomControl={false}
        attributionControl={false}
      >
        <DriverTracker driverPos={driverPosition} isAutoFollowing={isAutoFollowing} setAutoFollowing={setIsAutoFollowing} />

        
        {/* We use highly detailed roadmap tiles to show all malls, businesses, and street names perfectly */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        
        {/* Route Border (Google Maps uses a darker blue border) */}
        {routeLine.length > 0 && (
          <Polyline 
            positions={routeLine} 
            color="#2563eb" 
            weight={8} 
            opacity={0.9}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Completed Route (Faded grey path) */}
        {routeLine.length > 0 && (
          <Polyline 
            positions={[...routeLine.slice(0, currentSegment + 1), driverPosition]} 
            color="#9ca3af" 
            weight={5} 
            opacity={1}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Remaining Route Highlight (Crisp Google Maps light blue internal line) */}
        {routeLine.length > 0 && (
          <Polyline 
            positions={[driverPosition, ...routeLine.slice(currentSegment + 1)]} 
            color="#60a5fa" 
            weight={5} 
            opacity={1}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Store Marker */}
        <Marker position={actualStart} icon={storeIcon} zIndexOffset={10}>
          <Popup>The Vendor (Pickup)</Popup>
        </Marker>

        {/* Home Marker */}
        <Marker position={actualEnd} icon={homeIcon} zIndexOffset={10}>
          <Popup>Your Location (Dropoff)</Popup>
        </Marker>

        {/* Animated Driver Marker firmly planted on route geometry */}
        <Marker position={driverPosition} icon={getCarIcon(driverHeading)} zIndexOffset={100}>
          <Popup>Driver is arriving soon</Popup>
        </Marker>

      </MapContainer>

      {/* Recenter button — outside MapContainer to avoid z-index conflicts */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShouldRecenter(Date.now());
          setIsAutoFollowing(true);
        }}
        style={{
          position: 'absolute',
          bottom: 220,
          right: 16,
          zIndex: 50,
          background: 'white',
          border: '2px solid #e2e8f0',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          pointerEvents: 'all'
        }}
        title="Recenter Route"
      >
        🧭
      </button>
    </div>
  );
}
