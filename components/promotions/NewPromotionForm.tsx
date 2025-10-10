'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'
import { Loader2 } from 'lucide-react'

type MembershipType = Database['public']['Tables']['membership_types']['Row']

interface NewPromotionFormProps {
  membershipTypes: MembershipType[]
}

export default function NewPromotionForm({ membershipTypes }: NewPromotionFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed' | 'points',
    discount_value: '',
    start_date: '',
    end_date: '',
    min_usage_count: '0',
    max_usage_count: '',
    applicable_membership_types: [] as string[],
    is_active: true,
    terms_conditions: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from('promotions').insert({
        title: formData.title,
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        min_usage_count: parseInt(formData.min_usage_count) || 0,
        max_usage_count: formData.max_usage_count ? parseInt(formData.max_usage_count) : null,
        applicable_membership_types: formData.applicable_membership_types.length > 0 
          ? formData.applicable_membership_types 
          : null,
        is_active: formData.is_active,
        terms_conditions: formData.terms_conditions || null,
      })

      if (insertError) throw insertError

      router.push('/dashboard/promotions')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMembershipTypeToggle = (typeName: string) => {
    setFormData((prev) => ({
      ...prev,
      applicable_membership_types: prev.applicable_membership_types.includes(typeName)
        ? prev.applicable_membership_types.filter((t) => t !== typeName)
        : [...prev.applicable_membership_types, typeName],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-300">
            Título *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
            placeholder="Ej: Descuento de Verano"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-300">
            Descripción
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
            placeholder="Describe los detalles de la promoción"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="discount_type" className="block text-sm font-medium text-neutral-300">
              Tipo de Descuento *
            </label>
            <select
              id="discount_type"
              required
              value={formData.discount_type}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
              className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto Fijo ($)</option>
              <option value="points">Puntos</option>
            </select>
          </div>

          <div>
            <label htmlFor="discount_value" className="block text-sm font-medium text-neutral-300">
              Valor del Descuento *
            </label>
            <input
              type="number"
              id="discount_value"
              required
              step="0.01"
              min="0"
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
              placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-neutral-300">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              id="start_date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-neutral-300">
              Fecha de Fin *
            </label>
            <input
              type="date"
              id="end_date"
              required
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="min_usage_count" className="block text-sm font-medium text-neutral-300">
              Uso Mínimo Requerido
            </label>
            <input
              type="number"
              id="min_usage_count"
              min="0"
              value={formData.min_usage_count}
              onChange={(e) => setFormData({ ...formData, min_usage_count: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Número de veces que el miembro debe haber usado su tarjeta
            </p>
          </div>

          <div>
            <label htmlFor="max_usage_count" className="block text-sm font-medium text-neutral-300">
              Uso Máximo Permitido
            </label>
            <input
              type="number"
              id="max_usage_count"
              min="1"
              value={formData.max_usage_count}
              onChange={(e) => setFormData({ ...formData, max_usage_count: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
              placeholder="Ilimitado"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Dejar vacío para uso ilimitado
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-3">
            Tipos de Membresía Aplicables
          </label>
          <div className="space-y-2">
            {membershipTypes.map((type) => (
              <label key={type.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.applicable_membership_types.includes(type.name)}
                  onChange={() => handleMembershipTypeToggle(type.name)}
                  className="h-4 w-4 text-brand-500 focus:ring-orange-500 border-neutral-600 rounded"
                />
                <span className="ml-2 text-sm text-neutral-300">{type.name}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Si no seleccionas ninguno, la promoción aplicará a todos los tipos
          </p>
        </div>

        <div>
          <label htmlFor="terms_conditions" className="block text-sm font-medium text-neutral-300">
            Términos y Condiciones
          </label>
          <textarea
            id="terms_conditions"
            rows={4}
            value={formData.terms_conditions}
            onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-brand-500"
            placeholder="Términos y condiciones de la promoción"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 text-brand-500 focus:ring-orange-500 border-neutral-600 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-white">
            Activar promoción inmediatamente
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-md shadow-sm text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? 'Creando...' : 'Crear Promoción'}
        </button>
      </div>
    </form>
  )
}
