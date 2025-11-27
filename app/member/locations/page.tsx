'use client'

import { useEffect, useState } from 'react'
import { useRequireAuth } from '../context/MemberContext'
import { createClient } from '@/lib/supabase/client'
import { Loader2, MapPin, Phone, Mail, Navigation } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const LocationsMap = dynamic(() => import('./LocationsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-neutral-800 rounded-xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  )
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
}

export default function LocationsPage() {
  const { loading: authLoading } = useRequireAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLocations() {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, address, city, phone, email, latitude, longitude')
        .eq('is_active', true)
        .order('name')
      
      if (data) {
        setLocations(data)
        // Select first location with coordinates by default
        const firstWithCoords = data.find(l => l.latitude && l.longitude)
        if (firstWithCoords) setSelectedLocation(firstWithCoords)
      }
      setLoading(false)
    }
    fetchLocations()
  }, [])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  const locationsWithCoords = locations.filter(l => l.latitude && l.longitude)

  return (
    <div className="min-h-screen bg-neutral-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">Find Us</h1>
        <p className="text-neutral-400 text-sm mt-1">
          {locations.length} location{locations.length !== 1 ? 's' : ''} near you
        </p>
      </div>

      {/* Map */}
      {locationsWithCoords.length > 0 && (
        <div className="px-4 mb-4">
          <LocationsMap 
            locations={locationsWithCoords} 
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
          />
        </div>
      )}

      {/* Locations List */}
      <div className="px-4 space-y-3">
        {locations.map((location) => (
          <div
            key={location.id}
            onClick={() => setSelectedLocation(location)}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              selectedLocation?.id === location.id
                ? 'bg-orange-500/10 border-orange-500/50'
                : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{location.name}</h3>
                {location.address && (
                  <p className="text-sm text-neutral-400 mt-1 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {location.address}
                    {location.city && `, ${location.city}`}
                  </p>
                )}
                {location.phone && (
                  <a 
                    href={`tel:${location.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-neutral-400 mt-1 flex items-center gap-2 hover:text-orange-400"
                  >
                    <Phone className="w-4 h-4" />
                    {location.phone}
                  </a>
                )}
              </div>
              
              {location.latitude && location.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                  title="Get directions"
                >
                  <Navigation className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        ))}

        {locations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400">No locations available</p>
          </div>
        )}
      </div>
    </div>
  )
}
