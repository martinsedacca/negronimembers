import { createClient } from '@/lib/supabase/server'
import PromotionsList from '@/components/promotions/PromotionsList'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function PromotionsPage() {
  const supabase = await createClient()

  const { data: promotions, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching promotions:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Promociones</h1>
          <p className="mt-2 text-neutral-400">
            Gestiona promociones y descuentos para miembros
          </p>
        </div>
        <Link
          href="/dashboard/promotions/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Promoción
        </Link>
      </div>

      <PromotionsList promotions={promotions || []} />
    </div>
  )
}
