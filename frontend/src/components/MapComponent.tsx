import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import polyline from 'polyline';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  pickup: { lat: number; lng: number; label: string };
  dropoff: { lat: number; lng: number; label: string };
  routeGeometry?: string; 
}

const MapRecenter: React.FC<{ bounds: L.LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();   // forces correct layout
      map.fitBounds(bounds, { padding: [50, 50] });
    }, 0);
  }, [bounds, map]);

  return null;
};

const MapComponent: React.FC<MapProps> = ({ pickup, dropoff, routeGeometry }) => {
  const routePositions = (routeGeometry 
    ? polyline.decode(routeGeometry) 
    : []) as [number, number][];

  const bounds = L.latLngBounds([
    [pickup.lat, pickup.lng],
    [dropoff.lat, dropoff.lng]
  ]);

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
      {/* 1. Add this style tag to fix Tailwind image conflict locally */}
      <style>
        {`
          .leaflet-container img.leaflet-tile {
            max-width: none !important;
            max-height: none !important;
          }
        `}
      </style>

      <MapContainer 
        center={[pickup.lat, pickup.lng]} 
        zoom={12} 
        scrollWheelZoom={false} 
        className="h-full w-full"
        // 2. Explicit style to ensure height is respected
        style={{ height: '100%', minHeight: '100%' }}
      >
        <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <Marker position={[pickup.lat, pickup.lng]}>
          <Popup>📍 Pickup: {pickup.label}</Popup>
        </Marker>

        <Marker position={[dropoff.lat, dropoff.lng]}>
          <Popup>🏁 Destination: {dropoff.label}</Popup>
        </Marker>

        {routePositions.length > 0 && (
          <Polyline 
            positions={routePositions} 
            color="#2563eb" 
            weight={5} 
            opacity={0.8} 
          />
        )}

        <MapRecenter bounds={bounds} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;