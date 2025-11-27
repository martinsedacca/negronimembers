// Brand Colors - Consistent across the app
export const BRAND_COLORS = {
  member: {
    hex: '#F97316',
    name: 'Member Orange',
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    border: 'border-orange-500',
    hover: 'hover:bg-orange-600',
  },
  gold: {
    hex: '#EAB308',
    name: 'Gold Yellow',
    gradient: 'from-yellow-500 to-yellow-600',
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    border: 'border-yellow-500',
    hover: 'hover:bg-yellow-600',
  },
  brand: {
    hex: '#C08552',
    name: 'Negroni Brand',
    gradient: 'from-brand-500 to-brand-600',
    bg: 'bg-brand-500',
    text: 'text-brand-500',
    border: 'border-brand-500',
    hover: 'hover:bg-brand-600',
  }
} as const

// Membership Types
export const MEMBERSHIP_TYPES = {
  MEMBER: 'Member',
  GOLD: 'Gold',
} as const

export const MEMBERSHIP_PRICES = {
  MEMBER: 0,
  GOLD: 199,
} as const

// Points Configuration
export const POINTS_CONFIG = {
  MEMBER_MULTIPLIER: 1, // 1 point per dollar
  GOLD_MULTIPLIER: 2,   // 2 points per dollar (double)
  POINTS_TO_CURRENCY: 0.01, // $0.01 per point
} as const

// Validation Rules
export const VALIDATION_RULES = {
  MEMBER_NUMBER_PREFIX: {
    MEMBER: 'M',
    GOLD: 'G',
  },
  PHONE_MIN_LENGTH: 8,
  PHONE_MAX_LENGTH: 15,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  COUPON_CODE_MIN_LENGTH: 3,
  COUPON_CODE_MAX_LENGTH: 20,
  COUPON_CODE_REGEX: /^[A-Z0-9]+$/,
} as const

// Business Rules
export const BUSINESS_RULES = {
  MIN_AGE: 16,
  MAX_POINTS_PER_TRANSACTION: 1000,
  MAX_COUPON_DISCOUNT_PERCENTAGE: 100,
  MAX_REDEMPTIONS_DEFAULT: null, // null = unlimited
  DEFAULT_POINTS_EXPIRY_DAYS: 365,
} as const

// UI Configuration
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 10,
  ANALYTICS_PERIOD_OPTIONS: [7, 30, 90] as const,
  MAX_UPLOAD_SIZE_MB: 5,
  DEBOUNCE_DELAY_MS: 300,
} as const

// Status Colors
export const STATUS_COLORS = {
  active: 'bg-green-500 text-white',
  inactive: 'bg-neutral-500 text-white',
  pending: 'bg-yellow-500 text-white',
  expired: 'bg-red-500 text-white',
} as const

// Transaction Types
export const TRANSACTION_TYPES = {
  PURCHASE: 'purchase',
  REDEMPTION: 'redemption',
  ADJUSTMENT: 'adjustment',
  BONUS: 'bonus',
} as const

// Event Status
export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_COUPON_CODE: 'Coupon code must be uppercase alphanumeric (A-Z, 0-9)',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  MEMBER_CREATED: 'Member created successfully',
  MEMBER_UPDATED: 'Member updated successfully',
  COUPON_CREATED: 'Coupon created successfully',
  COUPON_REDEEMED: 'Coupon redeemed successfully',
  TRANSACTION_RECORDED: 'Transaction recorded successfully',
  EVENT_CREATED: 'Event created successfully',
  INVITATION_SENT: 'Invitations sent successfully',
} as const

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  TIME: 'h:mm a',
  DATETIME: 'MMM d, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
} as const
