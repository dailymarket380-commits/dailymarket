'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function createStoreIcon(emoji: string) {
  return L.divIcon({
    html: `
      <div style="
        background: white; 
        border: 2px solid #111; 
        border-radius: 50%; 
        width: 32px; 
        height: 32px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 18px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        ${emoji}
      </div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export interface StoreLocation {
  id: string;
  name: string;
  emoji: string;
  lat: number;
  lng: number;
  type: string;
}

export default function StoresMap({ stores }: { stores: StoreLocation[] }) {
  // Center roughly on Cape Town
  const center: [number, number] = [-33.924, 18.44];

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />

        {stores.map(store => (
          <Marker 
            key={store.id} 
            position={[store.lat, store.lng]} 
            icon={createStoreIcon(store.emoji)}
          >
            <Popup>
              <div style={{ padding: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{store.emoji}</div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800 }}>{store.name}</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>{store.type}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
