'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const storeIcon = L.divIcon({
  html: `<div style="background:black;border:3px solid white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 12px rgba(0,0,0,0.3);color:white;">🏬</div>`,
  className: '', iconSize: [36, 36], iconAnchor: [18, 18],
});

const homeIcon = L.divIcon({
  html: `<div style="background:white;border:3px solid black;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-size:16px;">📍</div>`,
  className: '', iconSize: [36, 36], iconAnchor: [18, 18],
});

const driverIcon = L.divIcon({
  html: `<div id="driver-arrow-inner" style="transform:rotate(135deg);width:44px;height:44px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 6px 8px rgba(0,0,0,0.4));">
    <svg viewBox="0 0 100 100" width="36" height="36">
      <path d="M 50 5 L 95 90 L 50 75 L 5 90 Z" fill="#4285F4" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
    </svg>
  </div>`,
  className: '', iconSize: [44, 44], iconAnchor: [22, 22],
});

// ── Fallback Cape Town demo coords ─────────────────────────────────────────
const DEMO_DRIVER:   [number, number] = [-33.931210, 18.428312];
const DEMO_STORE:    [number, number] = [-33.917957, 18.417252]; // Unity C&C
const DEMO_CUSTOMER: [number, number] = [-33.926615, 18.413233]; // Sea Point

function calcBearing(p1: [number, number], p2: [number, number]): number {
  const lat1 = p1[0] * Math.PI / 180, lat2 = p2[0] * Math.PI / 180;
  const dLon  = (p2[1] - p1[1]) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function calcDistMeters(p1: [number, number], p2: [number, number]): number {
  const R = 6371e3;
  const lat1 = p1[0] * Math.PI/180, lat2 = p2[0] * Math.PI/180;
  const dLat = (p2[0]-p1[0]) * Math.PI/180, dLon = (p2[1]-p1[1]) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const SIM_SPEED_M_PER_S = 18; // ~65 km/h

interface OSRMStep {
  maneuver: { location: [number, number]; type: string; modifier?: string };
  name: string;
  distance: number;
  polylineIdx?: number;
}

function mapStepsToPolyline(coords: [number, number][], steps: OSRMStep[]): OSRMStep[] {
  return steps.map(step => {
    const [manLng, manLat] = step.maneuver.location;
    let minDist = Infinity, nearestIdx = 0;
    coords.forEach(([lat, lng], i) => {
      const d = (lat - manLat) ** 2 + (lng - manLng) ** 2;
      if (d < minDist) { minDist = d; nearestIdx = i; }
    });
    return { ...step, polylineIdx: nearestIdx };
  });
}

interface Props {
  tripState: string;
  storeCoords?: [number, number];    // real geocoded store
  customerCoords?: [number, number]; // real geocoded customer
  driverCoords?: [number, number];   // real GPS driver start
  storeName?: string;
  onArrival?: (dest: string) => void;
  onTurn?: (msg: string) => void;
}

export default function DispatchMap({
  tripState,
  storeCoords,
  customerCoords,
  driverCoords,
  storeName = 'Unity C&C',
  onArrival,
  onTurn,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use real coords if provided, otherwise demo fallback
  const DRIVER_ORIGIN = driverCoords   || DEMO_DRIVER;
  const START_PT      = storeCoords    || DEMO_STORE;
  const END_PT        = customerCoords || DEMO_CUSTOMER;

  const mapRef          = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const outerLineRef    = useRef<L.Polyline | null>(null);
  const innerLineRef    = useRef<L.Polyline | null>(null);
  const greyLineRef     = useRef<L.Polyline | null>(null);
  const rafRef          = useRef<number | null>(null);

  const onArrivalRef = useRef(onArrival);
  const onTurnRef    = useRef(onTurn);
  useEffect(() => { onArrivalRef.current = onArrival; }, [onArrival]);
  useEffect(() => { onTurnRef.current    = onTurn;    }, [onTurn]);

  const routesRef = useRef({
    toStore:       [] as [number, number][],
    toCustomer:    [] as [number, number][],
    storeSteps:    [] as OSRMStep[],
    customerSteps: [] as OSRMStep[],
  });

  const stepIndexRef   = useRef(0);
  const spokenStepsRef = useRef(new Set<string>());

  // ── Init map — runs once per mount (parent changes key to re-mount with real coords) ──
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DRIVER_ORIGIN, zoom: 16,
      zoomControl: false, attributionControl: false,
    });

    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}').addTo(map);

    L.marker(START_PT, { icon: storeIcon, zIndexOffset: 10 }).addTo(map).bindPopup(storeName);
    L.marker(END_PT,   { icon: homeIcon,  zIndexOffset: 10 }).addTo(map).bindPopup('Customer Dropoff');

    driverMarkerRef.current = L.marker(DRIVER_ORIGIN, { icon: driverIcon, zIndexOffset: 100 }).addTo(map);

    greyLineRef.current  = L.polyline([], { color: '#a1a1a1', weight: 8,  opacity: 0.5, lineCap: 'round', lineJoin: 'round' }).addTo(map);
    outerLineRef.current = L.polyline([], { color: '#1c55b3', weight: 10, lineCap: 'round', lineJoin: 'round' }).addTo(map);
    innerLineRef.current = L.polyline([], { color: '#4285F4', weight: 6,  lineCap: 'round', lineJoin: 'round' }).addTo(map);

    mapRef.current = map;

    // Fit map to show driver + store + customer
    const bounds = L.latLngBounds([DRIVER_ORIGIN, START_PT, END_PT]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });

    // Fetch OSRM routes
    (async () => {
      try {
        const locs1 = `${DRIVER_ORIGIN[1]},${DRIVER_ORIGIN[0]};${START_PT[1]},${START_PT[0]}`;
        const d1 = await (await fetch(`https://router.project-osrm.org/route/v1/driving/${locs1}?overview=full&geometries=geojson&steps=true`)).json();
        if (d1.code === 'Ok') {
          const c1: [number,number][] = d1.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number,number]);
          routesRef.current.toStore    = c1;
          routesRef.current.storeSteps = mapStepsToPolyline(c1, d1.routes[0].legs[0].steps || []);
        }

        const locs2 = `${START_PT[1]},${START_PT[0]};${END_PT[1]},${END_PT[0]}`;
        const d2 = await (await fetch(`https://router.project-osrm.org/route/v1/driving/${locs2}?overview=full&geometries=geojson&steps=true`)).json();
        if (d2.code === 'Ok') {
          const c2: [number,number][] = d2.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number,number]);
          routesRef.current.toCustomer    = c2;
          routesRef.current.customerSteps = mapStepsToPolyline(c2, d2.routes[0].legs[0].steps || []);
        }

        // After routes load: set driver to start of first route
        if (routesRef.current.toStore.length) {
          driverMarkerRef.current?.setLatLng(routesRef.current.toStore[0]);
        }
      } catch (e) { console.warn('OSRM route error:', e); }
    })();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentional — parent remounts with key when coords change

  // ── Trip state machine ──────────────────────────────────────────────
  useEffect(() => {
    const map    = mapRef.current;
    const routes = routesRef.current;
    if (!map) return;

    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

    const clearRoutes = () => {
      outerLineRef.current?.setLatLngs([]);
      innerLineRef.current?.setLatLngs([]);
      greyLineRef.current?.setLatLngs([]);
    };

    if (tripState === 'idle') {
      clearRoutes();
      if (routes.toStore.length) {
        driverMarkerRef.current?.setLatLng(routes.toStore[0]);
        map.setView(routes.toStore[0], 16, { animate: false });
      }
      return;
    }

    if (tripState === 'at_store') {
      stepIndexRef.current = 0;
      spokenStepsRef.current.clear();
      clearRoutes();
      if (routes.toCustomer.length) {
        greyLineRef.current?.setLatLngs(routes.toCustomer);
        driverMarkerRef.current?.setLatLng(routes.toCustomer[0]);
      }
      return;
    }

    if (tripState === 'delivered') {
      clearRoutes();
      if (routes.toCustomer.length) {
        driverMarkerRef.current?.setLatLng(routes.toCustomer[routes.toCustomer.length - 1]);
      }
      return;
    }

    const routeLine = tripState === 'to_store' ? routes.toStore    : routes.toCustomer;
    const steps     = tripState === 'to_store' ? routes.storeSteps : routes.customerSteps;
    if (routeLine.length === 0) return;

    stepIndexRef.current = 0;
    spokenStepsRef.current.clear();

    if (tripState === 'to_store' && routes.toCustomer.length) {
      greyLineRef.current?.setLatLngs(routes.toCustomer);
    } else {
      greyLineRef.current?.setLatLngs([]);
    }

    let segIdx = 0, segProg = 0, lastTs: number | null = null, panSkip = 0;

    const tick = (ts: number) => {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(ts - lastTs, 64);
      lastTs = ts;

      if (segIdx >= routeLine.length - 1) return;

      const p1 = routeLine[segIdx];
      const p2 = routeLine[segIdx + 1];
      const segDist = calcDistMeters(p1, p2) || 1;
      const metersThisFrame = SIM_SPEED_M_PER_S * (dt / 1000);
      segProg += metersThisFrame / segDist;

      while (segProg >= 1 && segIdx < routeLine.length - 1) {
        segProg -= 1;
        segIdx++;
        if (segIdx < routeLine.length - 1) {
          const nextSegDist = calcDistMeters(routeLine[segIdx], routeLine[segIdx + 1]) || 1;
          segProg = (segProg * segDist) / nextSegDist;
        }
      }

      if (segIdx >= routeLine.length - 1) {
        const last = routeLine[routeLine.length - 1];
        driverMarkerRef.current?.setLatLng(last);
        outerLineRef.current?.setLatLngs([]);
        innerLineRef.current?.setLatLngs([]);
        if (tripState === 'to_store')    onArrivalRef.current?.('store');
        if (tripState === 'to_customer') onArrivalRef.current?.('customer');
        return;
      }

      const finalP1 = routeLine[segIdx];
      const finalP2 = routeLine[segIdx + 1];
      const lat = finalP1[0] + (finalP2[0] - finalP1[0]) * segProg;
      const lng = finalP1[1] + (finalP2[1] - finalP1[1]) * segProg;
      const brng = calcBearing(finalP1, finalP2);

      driverMarkerRef.current?.setLatLng([lat, lng]);
      const arrowEl = document.getElementById('driver-arrow-inner');
      if (arrowEl) arrowEl.style.transform = `rotate(${brng}deg)`;

      const remaining: [number, number][] = [[lat, lng], ...routeLine.slice(segIdx + 1)];
      outerLineRef.current?.setLatLngs(remaining);
      innerLineRef.current?.setLatLngs(remaining);

      panSkip++;
      if (panSkip >= 4) {
        map.panTo([lat, lng], { animate: true, duration: 0.2, easeLinearity: 1 });
        panSkip = 0;
      }

      // Turn-by-turn
      const cb = onTurnRef.current;
      if (cb && steps.length) {
        for (let i = stepIndexRef.current; i < steps.length; i++) {
          const step = steps[i];
          const type = step.maneuver?.type;
          const pIdx = step.polylineIdx || 0;

          if (segIdx >= pIdx) {
            spokenStepsRef.current.add(i + ':action');
            stepIndexRef.current = i + 1;
            continue;
          }

          if (type === 'arrive' || !step.name) continue;

          const distToTurn = calcDistMeters([lat, lng], routeLine[pIdx]);
          const secondsToTurn = distToTurn / SIM_SPEED_M_PER_S;
          let didSpeak = false;

          if (secondsToTurn > 35 && !spokenStepsRef.current.has(i + ':continue')) {
            const km = (distToTurn / 1000).toFixed(1);
            const m = Math.round(distToTurn / 100) * 100;
            cb(`Continue on ${step.name} for ${distToTurn >= 1000 ? km + ' kilometers' : m + ' meters'}`);
            spokenStepsRef.current.add(i + ':continue');
            didSpeak = true;
          }

          if (secondsToTurn <= 1.5 && !spokenStepsRef.current.has(i + ':action_prompt')) {
            const mod = step.maneuver?.modifier ?? 'straight';
            const cleanDir = mod.replace(/-/g, ' ');
            if (type === 'turn' || type === 'new name' || type === 'on ramp' || type === 'off ramp') {
              cb(cleanDir === 'straight' ? 'Continue straight' : `Turn ${cleanDir}`);
            } else if (type === 'roundabout' || type === 'rotary') {
              cb('Take the roundabout exit');
            } else if (type === 'fork') {
              cb(`Keep ${cleanDir}`);
            }
            spokenStepsRef.current.add(i + ':continue');
            spokenStepsRef.current.add(i + ':prep');
            spokenStepsRef.current.add(i + ':action_prompt');
            didSpeak = true;
          } else if (secondsToTurn <= 8 && !spokenStepsRef.current.has(i + ':prep')) {
            const distR = distToTurn >= 1000 ? (distToTurn/1000).toFixed(1) + ' kilometers' : Math.round(distToTurn / 10) * 10 + ' meters';
            const mod = step.maneuver?.modifier ?? 'straight';
            const cleanDir = mod.replace(/-/g, ' ');
            const prefix = distToTurn > 30 ? `In ${distR}, ` : '';
            if (type === 'depart') {
              const compass = ['north','northeast','east','southeast','south','southwest','west','northwest'][Math.round(brng / 45) % 8];
              cb(`${prefix}head ${compass} on ${step.name}`);
            } else if (type === 'turn' || type === 'new name' || type === 'on ramp' || type === 'off ramp') {
              cb(cleanDir === 'straight' ? `${prefix}continue straight onto ${step.name}` : `${prefix}turn ${cleanDir} onto ${step.name}`);
            } else if (type === 'roundabout' || type === 'rotary') {
              cb(`${prefix}at the roundabout, take the exit onto ${step.name}`);
            } else if (type === 'fork') {
              cb(cleanDir === 'straight' ? `${prefix}continue straight at the fork` : `${prefix}keep ${cleanDir} at the fork`);
            }
            spokenStepsRef.current.add(i + ':continue');
            spokenStepsRef.current.add(i + ':prep');
            didSpeak = true;
          }

          if (didSpeak) break;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [tripState]);

  return (
    <div
      ref={containerRef}
      style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
    />
  );
}
