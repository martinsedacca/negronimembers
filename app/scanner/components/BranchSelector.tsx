'use client'

import { MapPin, Check } from 'lucide-react'

interface Branch {
  id: string
  name: string
  address?: string
  city?: string
}

interface BranchSelectorProps {
  branches: Branch[]
  onSelect: (branchId: string) => void
  selectedId?: string | null
}

export default function BranchSelector({ branches, onSelect, selectedId }: BranchSelectorProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-white text-center mb-6">
        Select your location
      </h2>
      
      <div className="space-y-3">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => onSelect(branch.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all
                       flex items-start gap-4 text-left
                       ${selectedId === branch.id
                         ? 'bg-orange-500/20 border-orange-500 text-white'
                         : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                       }`}
          >
            <div className={`p-2 rounded-lg ${
              selectedId === branch.id ? 'bg-orange-500' : 'bg-neutral-700'
            }`}>
              <MapPin className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="font-semibold text-lg">{branch.name}</div>
              {branch.address && (
                <div className="text-sm text-neutral-400 mt-1">
                  {branch.address}
                </div>
              )}
              {branch.city && (
                <div className="text-xs text-neutral-500 mt-1">
                  {branch.city}
                </div>
              )}
            </div>
            
            {selectedId === branch.id && (
              <Check className="w-6 h-6 text-orange-500" />
            )}
          </button>
        ))}
      </div>
      
      <p className="text-xs text-neutral-500 text-center mt-6">
        This selection will be remembered until you change it
      </p>
    </div>
  )
}
