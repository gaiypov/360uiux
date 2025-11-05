/**
 * 360° РАБОТА - ULTRA EDITION
 * Input Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email обязателен' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Неверный формат email' };
  }

  return { isValid: true };
}

/**
 * Password validation
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Пароль обязателен' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Пароль должен быть не менее 8 символов' };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      error: 'Пароль должен содержать буквы и цифры',
    };
  }

  return { isValid: true };
}

/**
 * Phone number validation (Russian format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Телефон обязателен' };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // Russian phone numbers: +7 or 8, followed by 10 digits
  if (digitsOnly.length < 10 || digitsOnly.length > 11) {
    return { isValid: false, error: 'Неверный формат номера телефона' };
  }

  if (digitsOnly.length === 11 && !['7', '8'].includes(digitsOnly[0])) {
    return { isValid: false, error: 'Номер должен начинаться с +7 или 8' };
  }

  return { isValid: true };
}

/**
 * Name validation
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Имя обязательно' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Имя должно быть не менее 2 символов' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'Имя должно быть не более 50 символов' };
  }

  // Check for valid characters (letters, spaces, hyphens)
  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Имя может содержать только буквы, пробелы и дефисы' };
  }

  return { isValid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: string, fieldName: string = 'Поле'): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} обязательно` };
  }
  return { isValid: true };
}

/**
 * Min length validation
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string = 'Поле'
): ValidationResult {
  if (value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} должно быть не менее ${minLength} символов`,
    };
  }
  return { isValid: true };
}

/**
 * Max length validation
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string = 'Поле'
): ValidationResult {
  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} должно быть не более ${maxLength} символов`,
    };
  }
  return { isValid: true };
}

/**
 * Numeric validation
 */
export function validateNumeric(value: string, fieldName: string = 'Поле'): ValidationResult {
  if (!/^\d+$/.test(value)) {
    return { isValid: false, error: `${fieldName} должно содержать только цифры` };
  }
  return { isValid: true };
}

/**
 * URL validation
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL обязателен' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Неверный формат URL' };
  }
}

/**
 * Salary validation
 */
export function validateSalary(
  min: number,
  max?: number
): ValidationResult {
  if (min < 0) {
    return { isValid: false, error: 'Зарплата не может быть отрицательной' };
  }

  if (min > 10000000) {
    return { isValid: false, error: 'Зарплата не может превышать 10 млн ₽' };
  }

  if (max && max < min) {
    return { isValid: false, error: 'Максимальная зарплата должна быть больше минимальной' };
  }

  return { isValid: true };
}

/**
 * Form validation helper
 */
export function validateForm(
  fields: Record<string, string>,
  rules: Record<string, (value: string) => ValidationResult>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.keys(rules).forEach((fieldName) => {
    const result = rules[fieldName](fields[fieldName] || '');
    if (!result.isValid) {
      errors[fieldName] = result.error || 'Неверное значение';
      isValid = false;
    }
  });

  return { isValid, errors };
}
