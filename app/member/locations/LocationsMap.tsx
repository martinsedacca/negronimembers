'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Location {
  id: string
  name: string
  address: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  distance?: number
}

interface LocationsMapProps {
  locations: Location[]
  userLocation: { lat: number; lng: number } | null
  selectedLocation: Location | null
  onSelectLocation: (location: Location) => void
}

// Custom marker icon with distance label
const createIcon = (isSelected: boolean, distance?: number) => {
  const size = isSelected ? 48 : 40
  const distanceLabel = distance !== undefined ? `${distance.toFixed(1)} mi` : ''
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translateY(-50%);
      ">
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${isSelected ? '#f97316' : '#1a1a1a'};
          border: 3px solid ${isSelected ? '#fff' : '#f97316'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${isSelected ? '#fff' : '#f97316'}">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        ${distanceLabel ? `
          <div style="
            margin-top: 4px;
            padding: 2px 8px;
            background: ${isSelected ? '#f97316' : 'rgba(26,26,26,0.9)'};
            color: ${isSelected ? '#fff' : '#f97316'};
            font-size: 11px;
            font-weight: 600;
            border-radius: 10px;
            white-space: nowrap;
            border: 1px solid ${isSelected ? '#fff' : '#f97316'};
          ">${distanceLabel}</div>
        ` : ''}
      </div>
    `,
    iconSize: [size, size + (distanceLabel ? 24 : 0)],
    iconAnchor: [size / 2, size],
  })
}

// User location icon
const userLocationIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 0 8px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

// Component to handle map updates
function MapController({ 
  selectedLocation, 
  userLocation,
  locations 
}: { 
  selectedLocation: Location | null
  userLocation: { lat: number; lng: number } | null
  locations: Location[]
}) {
  const map = useMap()
  
  // Fit bounds to show all locations and user
  useEffect(() => {
    const points: [number, number][] = locations
      .filter(l => l.latitude && l.longitude)
      .map(l => [l.latitude!, l.longitude!])
    
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng])
    }
    
    if (points.length > 1) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (points.length === 1) {
      map.setView(points[0], 13)
    }
  }, [locations, userLocation, map])
  
  // Fly to selected location
  useEffect(() => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      map.flyTo([selectedLocation.latitude, selectedLocation.longitude], 15, {
        duration: 0.5
      })
    }
  }, [selectedLocation, map])
  
  return null
}

export default function LocationsMap({ locations, userLocation, selectedLocation, onSelectLocation }: LocationsMapProps) {
  // Calculate initial center
  const validLocations = locations.filter(l => l.latitude && l.longitude)
  
  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : validLocations.length > 0
      ? [
          validLocations.reduce((sum, l) => sum + (l.latitude || 0), 0) / validLocations.length,
          validLocations.reduce((sum, l) => sum + (l.longitude || 0), 0) / validLocations.length
        ]
      : [25.7617, -80.1918] // Default to Miami

  return (
    <div className="h-72 rounded-xl overflow-hidden border border-neutral-700">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController 
          selectedLocation={selectedLocation} 
          userLocation={userLocation}
          locations={validLocations}
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-neutral-900 font-medium">Your Location</div>
            </Popup>
          </Marker>
        )}
        
        {/* Location markers */}
        {validLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude!, location.longitude!]}
            icon={createIcon(selectedLocation?.id === location.id, location.distance)}
            eventHandlers={{
              click: () => onSelectLocation(location)
            }}
          >
            <Popup>
              <div className="text-neutral-900">
                <strong>{location.name}</strong>
                {location.distance !== undefined && (
                  <p className="text-sm text-orange-600 font-medium">{location.distance.toFixed(1)} miles</p>
                )}
                {location.address && (
                  <p className="text-sm mt-1">{location.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
