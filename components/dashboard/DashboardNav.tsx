'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Home,
  Users,
  Tag,
  CreditCard,
  LogOut,
  Menu,
  X,
  ScanLine,
  Building2,
  Filter,
  Calendar
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface DashboardNavProps {
  user: User
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Scanner', href: '/dashboard/scanner', icon: ScanLine },
    { name: 'Miembros', href: '/dashboard/members', icon: Users },
    { name: 'Segmentos', href: '/dashboard/segments', icon: Filter },
    { name: 'Promociones', href: '/dashboard/promotions', icon: Tag },
    { name: 'Eventos', href: '/dashboard/events', icon: Calendar },
    { name: 'Sucursales', href: '/dashboard/branches', icon: Building2 },
    { name: 'Tarjetas', href: '/dashboard/cards', icon: CreditCard },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-neutral-800 shadow-sm border-b border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/NEGRONI-Logo-hueso_png.png" 
                alt="Negroni" 
                className="h-8 w-auto"
              />
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition ${
                      isActive
                        ? 'border-brand-500 text-white'
                        : 'border-transparent text-neutral-300 hover:border-neutral-500 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center mr-4">
              <span className="text-sm text-neutral-300">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </button>
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-neutral-800">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-neutral-900 border-brand-500 text-white'
                      : 'border-transparent text-neutral-300 hover:bg-neutral-700 hover:border-neutral-500 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-neutral-700">
            <div className="flex items-center px-4 mb-3">
              <div className="text-sm font-medium text-neutral-200">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-base font-medium text-neutral-300 hover:text-white hover:bg-neutral-700"
            >
              <div className="flex items-center">
                <LogOut className="w-5 h-5 mr-3" />
                Salir
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
