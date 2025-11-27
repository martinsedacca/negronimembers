import { VALIDATION_RULES, ERROR_MESSAGES } from './constants'

/**
 * Email validation
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { valid: false, error: ERROR_MESSAGES.REQUIRED_FIELD }
  }
  
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_EMAIL }
  }
  
  return { valid: true }
}

/**
 * Phone validation
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: ERROR_MESSAGES.REQUIRED_FIELD }
  }
  
  const digitsOnly = phone.replace(/\D/g, '')
  
  if (digitsOnly.length < VALIDATION_RULES.PHONE_MIN_LENGTH || 
      digitsOnly.length > VALIDATION_RULES.PHONE_MAX_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_PHONE }
  }
  
  return { valid: true }
}

/**
 * Coupon code validation
 */
export function validateCouponCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.trim() === '') {
    return { valid: false, error: ERROR_MESSAGES.REQUIRED_FIELD }
  }
  
  const upperCode = code.toUpperCase()
  
  if (upperCode.length < VALIDATION_RULES.COUPON_CODE_MIN_LENGTH || 
      upperCode.length > VALIDATION_RULES.COUPON_CODE_MAX_LENGTH) {
    return { valid: false, error: `Code must be ${VALIDATION_RULES.COUPON_CODE_MIN_LENGTH}-${VALIDATION_RULES.COUPON_CODE_MAX_LENGTH} characters` }
  }
  
  if (!VALIDATION_RULES.COUPON_CODE_REGEX.test(upperCode)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_COUPON_CODE }
  }
  
  return { valid: true }
}

/**
 * Required field validation
 */
export function validateRequired(value: any, fieldName: string = 'Field'): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} is required` }
  }
  
  return { valid: true }
}

/**
 * Number range validation
 */
export function validateNumberRange(
  value: number,
  min?: number,
  max?: number,
  fieldName: string = 'Value'
): { valid: boolean; error?: string } {
  if (isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a number` }
  }
  
  if (min !== undefined && value < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` }
  }
  
  if (max !== undefined && value > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` }
  }
  
  return { valid: true }
}

/**
 * Date validation
 */
export function validateDate(dateString: string, fieldName: string = 'Date'): { valid: boolean; error?: string } {
  if (!dateString || dateString.trim() === '') {
    return { valid: false, error: `${fieldName} is required` }
  }
  
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName} is not a valid date` }
  }
  
  return { valid: true }
}

/**
 * Future date validation
 */
export function validateFutureDate(dateString: string, fieldName: string = 'Date'): { valid: boolean; error?: string } {
  const dateValidation = validateDate(dateString, fieldName)
  if (!dateValidation.valid) {
    return dateValidation
  }
  
  const date = new Date(dateString)
  const now = new Date()
  
  if (date <= now) {
    return { valid: false, error: `${fieldName} must be in the future` }
  }
  
  return { valid: true }
}

/**
 * URL validation
 */
export function validateURL(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { valid: true } // URL is optional in most cases
  }
  
  try {
    new URL(url)
    return { valid: true }
  } catch (e) {
    return { valid: false, error: 'Please enter a valid URL' }
  }
}

/**
 * Discount percentage validation
 */
export function validateDiscountPercentage(value: number): { valid: boolean; error?: string } {
  return validateNumberRange(value, 0, 100, 'Discount percentage')
}

/**
 * Discount amount validation
 */
export function validateDiscountAmount(value: number): { valid: boolean; error?: string } {
  return validateNumberRange(value, 0, undefined, 'Discount amount')
}

/**
 * Points validation
 */
export function validatePoints(value: number): { valid: boolean; error?: string } {
  return validateNumberRange(value, 0, undefined, 'Points')
}

/**
 * Member number validation
 */
export function validateMemberNumber(memberNumber: string): { valid: boolean; error?: string } {
  if (!memberNumber || memberNumber.trim() === '') {
    return { valid: false, error: 'Member number is required' }
  }
  
  const prefix = memberNumber.charAt(0)
  if (prefix !== 'M' && prefix !== 'G') {
    return { valid: false, error: 'Member number must start with M or G' }
  }
  
  const numberPart = memberNumber.substring(1)
  if (!/^\d{3,}$/.test(numberPart)) {
    return { valid: false, error: 'Member number must have at least 3 digits after prefix' }
  }
  
  return { valid: true }
}
