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
  const distanceText = distance !== undefined ? `${distance.toFixed(1)} mi` : ''
  
  return L.divIcon({
    className: '',
    html: `
      <div class="marker-container" style="position:relative;width:50px;height:60px;">
        <div style="
          position:absolute;
          left:50%;
          bottom:0;
          transform:translateX(-50%);
          width:${isSelected ? '36px' : '30px'};
          height:${isSelected ? '36px' : '30px'};
          background:${isSelected ? '#f97316' : '#262626'};
          border:2px solid ${isSelected ? '#fff' : '#f97316'};
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
        ">
          <span style="font-size:16px;">📍</span>
        </div>
        ${distanceText ? `
          <div style="
            position:absolute;
            left:50%;
            bottom:${isSelected ? '40px' : '34px'};
            transform:translateX(-50%);
            padding:2px 6px;
            background:${isSelected ? '#f97316' : '#262626'};
            color:#fff;
            font-size:10px;
            font-weight:bold;
            border-radius:8px;
            white-space:nowrap;
            box-shadow:0 1px 4px rgba(0,0,0,0.3);
          ">${distanceText}</div>
        ` : ''}
      </div>
    `,
    iconSize: [50, 60],
    iconAnchor: [25, 30],
  })
}

// User location icon (blue dot)
const userLocationIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width:16px;
      height:16px;
      background:#3b82f6;
      border:3px solid #fff;
      border-radius:50%;
      box-shadow:0 0 0 6px rgba(59,130,246,0.3);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
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
