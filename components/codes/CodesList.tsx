'use client'

import { useState } from 'react'
import { Edit, Trash2, Tag, Calendar, Users, ToggleLeft, ToggleRight, Plus, Gift } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CodeBenefitsModal from './CodeBenefitsModal'

interface Code {
  id: string
  code: string
  description: string
  expires_at: string | null
  max_uses: number | null
  is_active: boolean
  member_codes?: any[]
}

interface CodesListProps {
  codes: Code[]
}

export default function CodesList({ codes }: CodesListProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all')
  const [selectedCodeForBenefits, setSelectedCodeForBenefits] = useState<Code | null>(null)

  const filteredCodes = codes.filter(code => {
    if (filter === 'active') {
      return code.is_active && (!code.expires_at || new Date(code.expires_at) > new Date())
    }
    if (filter === 'expired') {
      return !code.is_active || (code.expires_at && new Date(code.expires_at) <= new Date())
    }
    return true
  })

  const handleToggleActive = async (codeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/codes/${codeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update code')
      
      router.refresh()
    } catch (error) {
      console.error('Error updating code:', error)
      alert('Error updating code status')
    }
  }

  const handleDelete = async (codeId: string, code: string) => {
    if (!confirm(`Delete code "${code}"?`)) return

    try {
      const response = await fetch(`/api/codes/${codeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete code')
      
      router.refresh()
    } catch (error) {
      console.error('Error deleting code:', error)
      alert('Error deleting code')
    }
  }

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-neutral-700">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            All ({codes.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Active ({codes.filter(c => c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date())).length})
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'expired'
                ? 'bg-red-500 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Expired ({codes.filter(c => !c.is_active || (c.expires_at && new Date(c.expires_at) <= new Date())).length})
          </button>
        </div>
      </div>

      {/* Codes Grid */}
      <div className="p-6">
        {filteredCodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCodes.map((code) => {
              const isExpired = code.expires_at && new Date(code.expires_at) <= new Date()
              const uses = code.member_codes?.length || 0
              const maxUses = code.max_uses || Infinity
              const usagePercent = maxUses !== Infinity ? (uses / maxUses) * 100 : 0

              return (
                <div
                  key={code.id}
                  className={`bg-neutral-900 border rounded-xl p-5 space-y-4 ${
                    isExpired || !code.is_active
                      ? 'border-neutral-700 opacity-60'
                      : 'border-orange-500/30'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-orange-500" />
                      <h3 className="text-lg font-bold text-white font-mono">
                        {code.code}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleToggleActive(code.id, code.is_active)}
                      className="text-neutral-400 hover:text-white"
                      title={code.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {code.is_active ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-neutral-500" />
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-300">
                    {code.description}
                  </p>

                  {/* Info */}
                  <div className="space-y-2 text-sm text-neutral-400">
                    {code.expires_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Expires: {new Date(code.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        {uses} / {maxUses === Infinity ? '∞' : maxUses} members
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {maxUses !== Infinity && (
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-neutral-700">
                    <button
                      onClick={() => setSelectedCodeForBenefits(code)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
                      title="View Benefits"
                    >
                      <Gift className="w-4 h-4" />
                      Benefits
                    </button>
                    <Link
                      href={`/dashboard/codes/${code.id}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition text-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(code.id, code.code)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No codes found</h3>
            <p className="text-neutral-400 mb-4">
              {filter === 'all' 
                ? 'Create your first code to enable benefits for specific member groups'
                : `No ${filter} codes available`
              }
            </p>
            {filter === 'all' && (
              <Link
                href="/dashboard/codes/new"
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Code
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Benefits Modal */}
      {selectedCodeForBenefits && (
        <CodeBenefitsModal
          code={selectedCodeForBenefits}
          onClose={() => setSelectedCodeForBenefits(null)}
        />
      )}
    </div>
  )
}
