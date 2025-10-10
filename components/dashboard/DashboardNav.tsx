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
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Scanner', href: '/dashboard/scanner', icon: ScanLine },
    { name: 'Miembros', href: '/dashboard/members', icon: Users },
    { name: 'Segmentos', href: '/dashboard/segments', icon: Filter },
    { name: 'Promociones', href: '/dashboard/promotions', icon: Tag },
    { name: 'Eventos', href: '/dashboard/events', icon: Calendar },
    { name: 'Sucursales', href: '/dashboard/branches', icon: Building2 },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
    { name: 'Tarjetas', href: '/dashboard/cards', icon: CreditCard },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-800 border-b border-neutral-700">
        <div className="flex items-center justify-between h-16 px-4">
          <img 
            src="/NEGRONI-Logo-hueso_png.png" 
            alt="Negroni" 
            className="h-8 w-auto"
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-700 transition"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out
          bg-neutral-800 border-r border-neutral-700
          ${
            mobileMenuOpen 
              ? 'translate-x-0' 
              : '-translate-x-full lg:translate-x-0'
          }
          ${
            sidebarCollapsed 
              ? 'lg:w-20' 
              : 'lg:w-64'
          }
          w-64
        `}
      >
        {/* Logo */}
        <div className="hidden lg:flex items-center justify-between h-16 px-4 border-b border-neutral-700">
          {!sidebarCollapsed && (
            <img 
              src="/NEGRONI-Logo-hueso_png.png" 
              alt="Negroni" 
              className="h-8 w-auto"
            />
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-700 transition ml-auto"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Logo mobile */}
        <div className="lg:hidden flex items-center h-16 px-4 border-b border-neutral-700">
          <img 
            src="/NEGRONI-Logo-hueso_png.png" 
            alt="Negroni" 
            className="h-8 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/50'
                        : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                    }
                    ${
                      sidebarCollapsed 
                        ? 'justify-center' 
                        : ''
                    }
                  `}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    sidebarCollapsed ? '' : 'mr-3'
                  }`} />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-neutral-700 p-4">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-medium text-sm">
                    {user.email?.[0].toUpperCase()}
                  </div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
              title="Salir"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
