'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Location {
  id: string
  name: string
  address: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
}

interface LocationsMapProps {
  locations: Location[]
  selectedLocation: Location | null
  onSelectLocation: (location: Location) => void
}

// Custom marker icon
const createIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${isSelected ? '40px' : '32px'};
        height: ${isSelected ? '40px' : '32px'};
        background: ${isSelected ? '#f97316' : '#404040'};
        border: 3px solid ${isSelected ? '#fff' : '#f97316'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.2s;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#fff' : '#f97316'}" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
    iconAnchor: [isSelected ? 20 : 16, isSelected ? 40 : 32],
  })
}

// Component to recenter map when selection changes
function MapController({ selectedLocation }: { selectedLocation: Location | null }) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      map.flyTo([selectedLocation.latitude, selectedLocation.longitude], 15, {
        duration: 0.5
      })
    }
  }, [selectedLocation, map])
  
  return null
}

export default function LocationsMap({ locations, selectedLocation, onSelectLocation }: LocationsMapProps) {
  // Calculate center based on all locations
  const validLocations = locations.filter(l => l.latitude && l.longitude)
  
  const center: [number, number] = validLocations.length > 0
    ? [
        validLocations.reduce((sum, l) => sum + (l.latitude || 0), 0) / validLocations.length,
        validLocations.reduce((sum, l) => sum + (l.longitude || 0), 0) / validLocations.length
      ]
    : [25.7617, -80.1918] // Default to Miami

  return (
    <div className="h-64 rounded-xl overflow-hidden border border-neutral-700">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController selectedLocation={selectedLocation} />
        
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
