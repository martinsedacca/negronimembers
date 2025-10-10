'use client'

import { useState } from 'react'
import { Save, Loader2, DollarSign, Users, Calendar, Award } from 'lucide-react'

interface SettingsFormProps {
  initialConfig: {
    points_rules?: {
      per_dollar_spent: number
      per_visit: number
      per_event_attended: number
    }
    tier_thresholds?: {
      Basic: { min_spent: number; min_visits: number }
      Silver: { min_spent: number; min_visits: number }
      Gold: { min_spent: number; min_visits: number }
      Platinum: { min_spent: number; min_visits: number }
    }
  }
}

export default function SettingsForm({ initialConfig }: SettingsFormProps) {
  const [pointsRules, setPointsRules] = useState(initialConfig.points_rules || {
    per_dollar_spent: 1,
    per_visit: 10,
    per_event_attended: 20,
  })

  const [tierThresholds, setTierThresholds] = useState(initialConfig.tier_thresholds || {
    Basic: { min_spent: 0, min_visits: 0 },
    Silver: { min_spent: 500, min_visits: 20 },
    Gold: { min_spent: 2000, min_visits: 50 },
    Platinum: { min_spent: 5000, min_visits: 100 },
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points_rules: pointsRules,
          tier_thresholds: tierThresholds,
        }),
      })

      if (!response.ok) throw new Error('Error al guardar')

      alert('Configuración guardada exitosamente!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Points Rules */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-orange-500" />
          Reglas de Puntos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Puntos por Dólar Gastado
            </label>
            <input
              type="number"
              value={pointsRules.per_dollar_spent}
              onChange={(e) => setPointsRules({ ...pointsRules, per_dollar_spent: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-neutral-700 text-white border border-neutral-600 rounded-lg text-lg font-semibold"
            />
            <p className="text-xs text-neutral-500 mt-2">
              Por cada $1 gastado, el cliente gana {pointsRules.per_dollar_spent} punto(s)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Puntos por Visita
            </label>
            <input
              type="number"
              value={pointsRules.per_visit}
              onChange={(e) => setPointsRules({ ...pointsRules, per_visit: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-neutral-700 text-white border border-neutral-600 rounded-lg text-lg font-semibold"
            />
            <p className="text-xs text-neutral-500 mt-2">
              Por cada visita sin compra, el cliente gana {pointsRules.per_visit} punto(s)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Puntos por Evento
            </label>
            <input
              type="number"
              value={pointsRules.per_event_attended}
              onChange={(e) => setPointsRules({ ...pointsRules, per_event_attended: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-neutral-700 text-white border border-neutral-600 rounded-lg text-lg font-semibold"
            />
            <p className="text-xs text-neutral-500 mt-2">
              Por asistir a un evento, el cliente gana {pointsRules.per_event_attended} punto(s)
            </p>
          </div>
        </div>
      </div>

      {/* Tier Thresholds */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Umbrales de Tier</h2>
        <p className="text-sm text-neutral-400 mb-6">
          Configura los requisitos mínimos para cada nivel de membresía
        </p>

        <div className="space-y-4">
          {Object.entries(tierThresholds).map(([tier, thresholds]) => (
            <div key={tier} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-neutral-900/50 rounded-lg">
              <div>
                <span className="text-lg font-bold text-white">{tier}</span>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Gasto Mínimo Total</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                  <input
                    type="number"
                    value={thresholds.min_spent}
                    onChange={(e) => setTierThresholds({
                      ...tierThresholds,
                      [tier]: { ...thresholds, min_spent: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full pl-8 pr-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
                    disabled={tier === 'Basic'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Visitas Mínimas</label>
                <input
                  type="number"
                  value={thresholds.min_visits}
                  onChange={(e) => setTierThresholds({
                    ...tierThresholds,
                    [tier]: { ...thresholds, min_visits: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg"
                  disabled={tier === 'Basic'}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <p className="text-sm text-blue-300">
            ℹ️ El tier se calcula automáticamente cuando un miembro cumple CUALQUIERA de los dos requisitos (gasto O visitas)
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2 text-lg font-semibold"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Configuración
            </>
          )}
        </button>
      </div>
    </div>
  )
}
