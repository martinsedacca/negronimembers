'use client'
import { useState, useMemo } from 'react'
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
  ChevronRight,
  ClipboardList,
  BarChart3,
  Ticket,
  ChevronDown,
  ChevronUp,
  Crown
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import PushNotificationButton from '@/components/ui/PushNotificationButton'

interface DashboardNavProps {
  user: User
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface NavItem {
  name: string
  href: string
  icon: any
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['DAILY OPERATIONS', 'MEMBERS', 'BENEFITS & REWARDS'])

  const navigationSections: NavSection[] = [
    {
      title: 'DAILY OPERATIONS',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Scanner', href: '/dashboard/scanner', icon: ScanLine },
        { name: 'Events', href: '/dashboard/events', icon: Calendar },
      ]
    },
    {
      title: 'MEMBERS',
      items: [
        { name: 'Members', href: '/dashboard/members', icon: Users },
        { name: 'Segments', href: '/dashboard/segments', icon: Filter },
        { name: 'Onboarding', href: '/dashboard/onboarding', icon: ClipboardList },
      ]
    },
    {
      title: 'BENEFITS & REWARDS',
      items: [
        { name: 'Membership Levels', href: '/dashboard/membership-types', icon: Crown },
        { name: 'Benefits', href: '/dashboard/promotions', icon: Tag },
        { name: 'Codes', href: '/dashboard/codes', icon: Ticket },
        { name: 'Digital Cards', href: '/dashboard/cards', icon: CreditCard },
      ]
    },
    {
      title: 'LOCATIONS',
      items: [
        { name: 'Locations', href: '/dashboard/branches', icon: Building2 },
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { name: 'Overview', href: '/dashboard/analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { name: 'Users', href: '/dashboard/users', icon: Users },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ]
    }
  ]

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

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
          <div className="flex items-center gap-2">
            <PushNotificationButton />
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
            {navigationSections.map((section) => {
              const isExpanded = expandedSections.includes(section.title)
              
              return (
                <div key={section.title} className="mb-2">
                  {/* Section Header */}
                  {!sidebarCollapsed && (
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider hover:text-neutral-300 transition"
                    >
                      <span>{section.title}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  )}
                  
                  {/* Section Items */}
                  {(isExpanded || sidebarCollapsed) && (
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            prefetch={true}
                            onClick={() => mobileMenuOpen && setMobileMenuOpen(false)}
                            className={`
                              flex items-center px-3 py-2 rounded-lg text-sm font-medium
                              ${
                                isActive
                                  ? 'bg-orange-500 text-white shadow-lg'
                                  : 'text-neutral-300 hover:bg-neutral-700/50 hover:text-white active:scale-[0.98]'
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
                  )}
                </div>
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
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
