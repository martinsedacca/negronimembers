import { createClient } from '@/lib/supabase/server'
import CardsList from '@/components/cards/CardsList'
import { Wallet } from 'lucide-react'

export default async function CardsPage() {
  const supabase = await createClient()

  // Fetch members with their wallet passes
  const { data: members, error } = await supabase
    .from('members')
    .select(`
      *,
      wallet_passes (*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching members:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarjetas Digitales</h1>
          <p className="mt-2 text-gray-600">
            Gestiona y genera tarjetas para Apple Wallet y Google Wallet
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Wallet className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-700 font-medium">
            {members?.length || 0} miembros activos
          </span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Wallet className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generación de Tarjetas Digitales
            </h3>
            <p className="text-gray-700 mb-4">
              Desde aquí podrás generar tarjetas digitales para Apple Wallet y Google Wallet 
              para cada miembro activo. Las tarjetas incluirán:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                Información del miembro
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                Número de membresía único
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                Código QR para validación
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                Puntos acumulados
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                Tipo de membresía
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                Actualizaciones en tiempo real
              </li>
            </ul>
            <div className="bg-white rounded-lg p-4 border border-indigo-100">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">📱 Estado de Integración:</span>
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Apple Wallet</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    Pendiente
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Google Wallet</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    Pendiente
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Para implementar la generación de tarjetas, consulta la guía en{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded">WALLET_INTEGRATION.md</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      <CardsList members={members || []} />
    </div>
  )
}
