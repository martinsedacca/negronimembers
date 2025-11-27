import { MEMBERSHIP_TYPES, POINTS_CONFIG, BRAND_COLORS } from './constants'

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Format points
 */
export function formatPoints(points: number): string {
  return new Intl.NumberFormat('en-US').format(points)
}

/**
 * Calculate points for purchase
 */
export function calculatePoints(amount: number, membershipType: string): number {
  const multiplier = membershipType === MEMBERSHIP_TYPES.GOLD 
    ? POINTS_CONFIG.GOLD_MULTIPLIER 
    : POINTS_CONFIG.MEMBER_MULTIPLIER
  
  return Math.floor(amount * multiplier)
}

/**
 * Convert points to currency value
 */
export function pointsToCurrency(points: number): number {
  return points * POINTS_CONFIG.POINTS_TO_CURRENCY
}

/**
 * Get membership color
 */
export function getMembershipColor(membershipType: string): {
  hex: string
  name: string
  gradient: string
  bg: string
  text: string
  border: string
  hover: string
} {
  return membershipType === MEMBERSHIP_TYPES.GOLD 
    ? BRAND_COLORS.gold 
    : BRAND_COLORS.member
}

/**
 * Get tier badge
 */
export function getTierBadge(membershipType: string): string {
  return membershipType === MEMBERSHIP_TYPES.GOLD ? '👑' : '⭐'
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  // Format with country code
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  
  // Return as-is if not standard format
  return phone
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

/**
 * Format date relative (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Generate member number
 */
export function generateMemberNumber(membershipType: string, lastNumber: number = 0): string {
  const prefix = membershipType === MEMBERSHIP_TYPES.GOLD ? 'G' : 'M'
  const number = (lastNumber + 1).toString().padStart(3, '0')
  return `${prefix}${number}`
}

/**
 * Check if coupon is expired
 */
export function isCouponExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) <= new Date()
}

/**
 * Check if coupon is valid
 */
export function isCouponValid(
  isActive: boolean,
  expiresAt: string | null,
  redemptions: number,
  maxRedemptions: number | null
): { valid: boolean; reason?: string } {
  if (!isActive) {
    return { valid: false, reason: 'Coupon is not active' }
  }
  
  if (isCouponExpired(expiresAt)) {
    return { valid: false, reason: 'Coupon has expired' }
  }
  
  if (maxRedemptions && redemptions >= maxRedemptions) {
    return { valid: false, reason: 'Coupon has reached redemption limit' }
  }
  
  return { valid: true }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Safe JSON parse
 */
export function safeJSONParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    return defaultValue
  }
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Download JSON as file
 */
export function downloadJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Download CSV
 */
export function downloadCSV(data: any[], filename: string): void {
  if (data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
