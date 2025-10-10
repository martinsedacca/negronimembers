import { createClient } from '@/lib/supabase/server'
import NewPromotionForm from '@/components/promotions/NewPromotionForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewPromotionPage() {
  const supabase = await createClient()

  const { data: membershipTypes } = await supabase
    .from('membership_types')
    .select('*')
    .order('name')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/promotions"
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a promociones
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900">Nueva Promoción</h1>
        <p className="mt-2 text-neutral-600">
          Crea una nueva promoción para aplicar a las tarjetas de membresía
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <NewPromotionForm membershipTypes={membershipTypes || []} />
      </div>
    </div>
  )
}
