'use client'

import { useState } from 'react'
import { X, Save, Loader2, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Promotion = Database['public']['Tables']['promotions']['Row']
type MembershipType = Database['public']['Tables']['membership_types']['Row']

interface EditPromotionModalProps {
  promotion: Promotion
  membershipTypes: MembershipType[]
  onClose: () => void
  onUpdate: () => void
}

export default function EditPromotionModal({ 
  promotion, 
  membershipTypes,
  onClose, 
  onUpdate 
}: EditPromotionModalProps) {
  const [formData, setFormData] = useState({
    title: promotion.title,
    description: promotion.description || '',
    discount_type: promotion.discount_type,
    discount_value: promotion.discount_value.toString(),
    start_date: new Date(promotion.start_date).toISOString().slice(0, 16),
    end_date: new Date(promotion.end_date).toISOString().slice(0, 16),
    min_usage_count: promotion.min_usage_count.toString(),
    max_usage_count: promotion.max_usage_count?.toString() || '',
    applicable_membership_types: promotion.applicable_membership_types || [],
    is_active: promotion.is_active,
    terms_conditions: promotion.terms_conditions || '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/promotions/${promotion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discount_value: parseFloat(formData.discount_value),
          min_usage_count: parseInt(formData.min_usage_count),
          max_usage_count: formData.max_usage_count ? parseInt(formData.max_usage_count) : null,
        }),
      })

      if (!response.ok) throw new Error('Error al guardar')

      onUpdate()
      onClose()
    } catch (error: any) {
      alert('Error al guardar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta promoción?')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/promotions/${promotion.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar')

      onUpdate()
      onClose()
    } catch (error: any) {
      alert('Error al eliminar: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

  const toggleMembershipType = (type: string) => {
    const current = formData.applicable_membership_types
    if (current.includes(type)) {
      setFormData({
        ...formData,
        applicable_membership_types: current.filter(t => t !== type)
      })
    } else {
      setFormData({
        ...formData,
        applicable_membership_types: [...current, type]
      })
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">Editar Promoción</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Tipo de Descuento
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto Fijo</option>
                <option value="points">Puntos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Fecha de Fin
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Usage Counts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Usos Mínimos
              </label>
              <input
                type="number"
                value={formData.min_usage_count}
                onChange={(e) => setFormData({ ...formData, min_usage_count: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Usos Máximos (opcional)
              </label>
              <input
                type="number"
                value={formData.max_usage_count}
                onChange={(e) => setFormData({ ...formData, max_usage_count: e.target.value })}
                placeholder="Sin límite"
                className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Membership Types */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Tipos de Membresía Aplicables
            </label>
            <div className="flex flex-wrap gap-2">
              {membershipTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleMembershipType(type.name)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    formData.applicable_membership_types.includes(type.name)
                      ? 'bg-orange-500 text-white'
                      : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Si no seleccionas ninguno, aplica para todos
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-300">
              Promoción Activa
            </label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                formData.is_active ? 'bg-green-500' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  formData.is_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Términos y Condiciones
            </label>
            <textarea
              value={formData.terms_conditions}
              onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
              rows={3}
              placeholder="Opcional..."
              className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-800 border-t border-neutral-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Eliminar
              </>
            )}
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
