import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import polyline from 'polyline';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
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
  routeGeometry?: string; // Encoded polyline string from Backend
}

// Helper to auto-fit map bounds
const MapRecenter: React.FC<{ bounds: L.LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

const MapComponent: React.FC<MapProps> = ({ pickup, dropoff, routeGeometry }) => {
  const routePositions = (routeGeometry 
    ? polyline.decode(routeGeometry) 
    : []) as [number, number][];

  // Calculate bounds to fit both markers
  const bounds = L.latLngBounds([
    [pickup.lat, pickup.lng],
    [dropoff.lat, dropoff.lng]
  ]);

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
      <MapContainer 
        center={[pickup.lat, pickup.lng]} 
        zoom={13} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[pickup.lat, pickup.lng]}>
          <Popup>📍 Pickup: {pickup.label}</Popup>
        </Marker>

        <Marker position={[dropoff.lat, dropoff.lng]}>
          <Popup>🏁 Destination: {dropoff.label}</Popup>
        </Marker>

        {/* Draw the Blue Route Line */}
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