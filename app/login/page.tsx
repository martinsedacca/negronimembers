'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      setError('¡Cuenta creada! Por favor inicia sesión.')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 p-4">
      <div className="max-w-md w-full bg-neutral-800 rounded-2xl shadow-xl p-8 border border-neutral-700">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/NEGRONI-Logo-hueso_png.png" 
            alt="Negroni" 
            className="h-16 w-auto mb-4"
          />
          <p className="text-neutral-400 mt-2 text-center">
            Sistema de gestión de tarjetas de membresía
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-neutral-400"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-neutral-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-neutral-700 text-neutral-200 py-3 px-4 rounded-lg font-medium hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Registrarse
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-400">
          <p>Usa este sistema para gestionar membresías y generar tarjetas digitales</p>
        </div>
      </div>
    </div>
  )
}
