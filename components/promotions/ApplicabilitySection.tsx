'use client'

import { Users, Tag, X } from 'lucide-react'

interface ApplicabilitySectionProps {
  membershipTypes: any[]
  codes: any[]
  selectedTiers: string[]
  selectedCodes: string[]
  isAllMembers: boolean
  onToggleAll: (checked: boolean) => void
  onToggleTier: (tier: string) => void
  onToggleCode: (codeId: string) => void
}

export default function ApplicabilitySection({
  membershipTypes,
  codes,
  selectedTiers,
  selectedCodes,
  isAllMembers,
  onToggleAll,
  onToggleTier,
  onToggleCode,
}: ApplicabilitySectionProps) {
  
  const getCodeName = (codeId: string) => {
    return codes.find(c => c.id === codeId)?.code || codeId
  }

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-neutral-300">
          Who can access this benefit? *
        </label>
        {(selectedTiers.length > 0 || selectedCodes.length > 0) && !isAllMembers && (
          <span className="text-xs text-orange-400">
            {selectedTiers.length + selectedCodes.length} criteria selected
          </span>
        )}
      </div>

      {/* All Members Checkbox */}
      <label className="flex items-start cursor-pointer p-3 rounded-lg hover:bg-neutral-800 transition">
        <input
          type="checkbox"
          checked={isAllMembers}
          onChange={(e) => onToggleAll(e.target.checked)}
          className="mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-neutral-600 rounded"
        />
        <div className="ml-3">
          <span className="text-sm text-white font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            All Members
          </span>
          <p className="text-xs text-neutral-400 mt-1">
            Available to everyone (overrides other selections)
          </p>
        </div>
      </label>

      {/* Tiers Section */}
      {!isAllMembers && (
        <>
          <div className="pt-3 border-t border-neutral-700">
            <div className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Membership Tiers
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Select one or more tiers (members with ANY selected tier can access)
            </p>
            <div className="space-y-2">
              {membershipTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center cursor-pointer p-2 rounded hover:bg-neutral-800 transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedTiers.includes(type.name)}
                    onChange={() => onToggleTier(type.name)}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-neutral-600 rounded"
                  />
                  <span className="ml-3 text-sm text-white">{type.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Codes Section */}
          <div className="pt-3 border-t border-neutral-700">
            <div className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-500" />
              Codes
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Select one or more codes (members with ANY selected code can access)
            </p>
            {codes.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {codes.map((code) => (
                  <label
                    key={code.id}
                    className="flex items-start cursor-pointer p-2 rounded hover:bg-neutral-800 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCodes.includes(code.id)}
                      onChange={() => onToggleCode(code.id)}
                      className="mt-0.5 h-4 w-4 text-orange-500 focus:ring-orange-500 border-neutral-600 rounded"
                    />
                    <div className="ml-3">
                      <span className="text-sm text-white font-mono">{code.code}</span>
                      <p className="text-xs text-neutral-400">{code.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-neutral-800 rounded text-xs text-neutral-400 text-center">
                No active codes available. Create codes in the Codes section.
              </div>
            )}
          </div>

          {/* Summary */}
          {(selectedTiers.length > 0 || selectedCodes.length > 0) && (
            <div className="pt-3 border-t border-neutral-700">
              <div className="text-xs font-medium text-neutral-300 mb-2">
                Access Summary (OR logic):
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTiers.map((tier) => (
                  <div
                    key={tier}
                    className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs text-orange-400"
                  >
                    <Tag className="w-3 h-3" />
                    {tier}
                    <button
                      type="button"
                      onClick={() => onToggleTier(tier)}
                      className="ml-1 hover:text-orange-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {selectedCodes.map((codeId) => (
                  <div
                    key={codeId}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-400 font-mono"
                  >
                    <Tag className="w-3 h-3" />
                    {getCodeName(codeId)}
                    <button
                      type="button"
                      onClick={() => onToggleCode(codeId)}
                      className="ml-1 hover:text-purple-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Members with <strong>any</strong> of these tiers or codes can access this benefit
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
