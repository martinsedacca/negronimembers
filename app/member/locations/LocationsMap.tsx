'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Override Leaflet z-index to prevent it from covering modals
const leafletStyles = `
  .leaflet-pane,
  .leaflet-top,
  .leaflet-bottom,
  .leaflet-control {
    z-index: 1 !important;
  }
  .leaflet-popup-pane {
    z-index: 2 !important;
  }
`

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface Location {
  id: string
  name: string
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
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

// Create custom icon using standard Leaflet icon
const createIcon = (isSelected: boolean) => {
  return new L.Icon({
    iconUrl: isSelected 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

// User location icon (blue)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
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
    <>
      <style>{leafletStyles}</style>
      <div className="h-72 rounded-xl overflow-hidden border border-neutral-700 relative z-0">
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
            icon={userIcon}
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
            icon={createIcon(selectedLocation?.id === location.id)}
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
    </>
  )
}
