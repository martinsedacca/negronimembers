'use client'

import { useState } from 'react'
import { DollarSign, MapPin, Save, Loader2, PartyPopper } from 'lucide-react'

interface TransactionFormProps {
  memberData: any
  onComplete: () => void
  onCancel: () => void
}

export default function TransactionForm({ memberData, onComplete, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    event_type: 'purchase' as 'purchase' | 'event' | 'visit',
    amount_spent: '',
    branch_location: '',
    notes: '',
  })
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/scanner/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: memberData.member.id,
          event_type: formData.event_type,
          amount_spent: parseFloat(formData.amount_spent) || 0,
          branch_location: formData.branch_location,
          applied_promotions: selectedPromotions,
          notes: formData.notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API Error Response:', data)
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error
        alert(`Error: ${errorMsg}`)
        throw new Error(errorMsg || 'Error al registrar transacción')
      }

      setSuccess(data)
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onComplete()
      }, 3000)
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const togglePromotion = (promoId: string) => {
    setSelectedPromotions(prev =>
      prev.includes(promoId)
        ? prev.filter(id => id !== promoId)
        : [...prev, promoId]
    )
  }

  if (success) {
    return (
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-8 text-center">
        <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">
          {success.new_tier ? '🎉 ¡Subió de Tier!' : '✅ Registrado!'}
        </h3>
        <p className="text-neutral-300 mb-4">{success.message}</p>
        <div className="bg-neutral-900/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Puntos ganados:</span>
            <span className="text-white font-semibold">+{success.points_earned}</span>
          </div>
          {success.total_discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Descuento total:</span>
              <span className="text-green-400 font-semibold">${success.total_discount}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-neutral-700">
        <h2 className="text-lg font-semibold text-white">Registrar Transacción</h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Tipo</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'purchase', label: 'Compra' },
              { value: 'event', label: 'Evento' },
              { value: 'visit', label: 'Visita' },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, event_type: type.value as any })}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
                  formData.event_type === type.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        {formData.event_type === 'purchase' && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Monto Gastado *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="number"
                step="0.01"
                value={formData.amount_spent}
                onChange={(e) => setFormData({ ...formData, amount_spent: e.target.value })}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required={formData.event_type === 'purchase'}
              />
            </div>
          </div>
        )}

        {/* Branch */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Sucursal</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              value={formData.branch_location}
              onChange={(e) => setFormData({ ...formData, branch_location: e.target.value })}
              placeholder="Ej: Palermo, Recoleta..."
              className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Promotions */}
        {memberData.available_promotions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Promociones a Aplicar
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {memberData.available_promotions.map((promo: any) => (
                <label
                  key={promo.promotion_id}
                  className="flex items-start gap-3 p-3 bg-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-600 transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedPromotions.includes(promo.promotion_id)}
                    onChange={() => togglePromotion(promo.promotion_id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{promo.title}</div>
                    <div className="text-xs text-neutral-400">{promo.discount_value}{promo.discount_type === 'percentage' ? '%' : '$'} OFF</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Notas</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas opcionales..."
            rows={2}
            className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-neutral-400 resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-neutral-700 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-neutral-700 text-neutral-300 rounded-lg font-medium hover:bg-neutral-600 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Registrar
            </>
          )}
        </button>
      </div>
    </form>
  )
}
