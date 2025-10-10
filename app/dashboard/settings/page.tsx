import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/settings/SettingsForm'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: config } = await supabase
    .from('system_config')
    .select('*')

  const configObj = config?.reduce((acc, item) => {
    acc[item.key] = item.value
    return acc
  }, {} as Record<string, any>) || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-orange-500" />
            Configuración del Sistema
          </h1>
          <p className="mt-2 text-neutral-400">
            Configura reglas de puntos y umbrales de membresía
          </p>
        </div>
      </div>

      <SettingsForm initialConfig={configObj} />
    </div>
  )
}
