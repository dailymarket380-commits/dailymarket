'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const pinIcon = L.divIcon({
  html: `<div style="background: black; padding: 6px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"><svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
    locationfound(e) {
      setPosition(e.latlng);
      e.target.flyTo(e.latlng, map.getZoom());
    },
  });
  const map = useMapEvents({});

  useEffect(() => {
    map.locate();
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={pinIcon} />
  );
}

export default function LocationPickerMap({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    if (position) {
      onLocationChange(position.lat, position.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
      <MapContainer 
        center={[-33.98438, 25.65936]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}
