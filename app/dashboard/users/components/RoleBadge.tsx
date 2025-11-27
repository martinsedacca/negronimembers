'use client'

// =====================================================================
// COMPONENT: RoleBadge
// =====================================================================
// Badge visual para mostrar el rol de un usuario
// =====================================================================

import { ROLE_LABELS, ROLE_COLORS, ROLE_ICONS, type UserRole } from '@/lib/auth/roles'

interface RoleBadgeProps {
  role: UserRole
  size?: 'sm' | 'md' | 'lg'
}

export default function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const colors = ROLE_COLORS[role]
  const label = ROLE_LABELS[role]
  const icon = ROLE_ICONS[role]

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colors.bg} ${colors.text} ${sizeClasses[size]}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  )
}
