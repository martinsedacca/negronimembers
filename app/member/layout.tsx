'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CreditCard, Gift, User, MapPin } from 'lucide-react'
import { MemberProvider } from './context/MemberContext'

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // No mostrar nav en auth y onboarding
  const showNav = !pathname.includes('/auth') && !pathname.includes('/onboarding')

  const navItems = [
    { href: '/member/pass', icon: CreditCard, label: 'Pass' },
    { href: '/member/benefits', icon: Gift, label: 'Benefits' },
    { href: '/member/locations', icon: MapPin, label: 'Find Us' },
    { href: '/member/profile', icon: User, label: 'Profile' },
  ]

  return (
    <MemberProvider>
      <div className="h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex flex-col overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20">
          {children}
        </main>

        {/* Bottom Navigation */}
        {showNav && (
          <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 z-50"
        >
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center gap-1 relative"
                  >
                    <motion.div
                      className={`p-2 rounded-xl transition-colors ${
                        isActive ? 'bg-orange-500/20 text-orange-500' : 'text-neutral-400'
                      }`}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>
                    <span
                      className={`text-xs font-medium ${
                        isActive ? 'text-orange-500' : 'text-neutral-400'
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
          </motion.nav>
        )}
      </div>
    </MemberProvider>
  )
}
