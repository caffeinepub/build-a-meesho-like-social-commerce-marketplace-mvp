export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateUPI(upiId: string): ValidationResult {
  if (!upiId.trim()) {
    return { isValid: false, error: 'UPI ID is required' };
  }
  if (!upiId.includes('@')) {
    return { isValid: false, error: 'Please enter a valid UPI ID (e.g., user@bank)' };
  }
  const parts = upiId.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { isValid: false, error: 'Invalid UPI ID format' };
  }
  return { isValid: true };
}

export function validateCardNumber(cardNumber: string): ValidationResult {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!cleaned) {
    return { isValid: false, error: 'Card number is required' };
  }
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Card number must contain only digits' };
  }
  if (cleaned.length < 13 || cleaned.length > 19) {
    return { isValid: false, error: 'Card number must be between 13 and 19 digits' };
  }
  return { isValid: true };
}

export function validateCardExpiry(expiry: string): ValidationResult {
  if (!expiry.trim()) {
    return { isValid: false, error: 'Expiry date is required' };
  }
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) {
    return { isValid: false, error: 'Expiry must be in MM/YY format' };
  }
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Invalid month (must be 01-12)' };
  }
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, error: 'Card has expired' };
  }
  return { isValid: true };
}

export function validateCVV(cvv: string): ValidationResult {
  if (!cvv.trim()) {
    return { isValid: false, error: 'CVV is required' };
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    return { isValid: false, error: 'CVV must be 3 or 4 digits' };
  }
  return { isValid: true };
}

export function validateCardholderName(name: string): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, error: 'Cardholder name is required' };
  }
  if (name.trim().length < 3) {
    return { isValid: false, error: 'Name must be at least 3 characters' };
  }
  return { isValid: true };
}
