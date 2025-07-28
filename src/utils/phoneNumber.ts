/**
 * Phone Number Utilities
 *
 * Utilities for formatting and validating phone numbers
 * Supports international formats
 */

/**
 * Format phone number as user types
 * Supports various international formats
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '');

  // If it starts with +, it's international
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // For US numbers (10 digits)
  if (cleaned.length <= 10 && /^\d+$/.test(cleaned)) {
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const [, area, prefix, line] = match;
      if (line) {
        return `(${area}) ${prefix}-${line}`;
      } else if (prefix) {
        return `(${area}) ${prefix}`;
      } else if (area) {
        return area.length < 3 ? area : `(${area})`;
      }
    }
  }

  return cleaned;
};

/**
 * Validate phone number
 * Accepts various international formats
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove formatting for validation
  const cleaned = phone.replace(/[^\d+]/g, '');

  // International format (starts with +)
  if (cleaned.startsWith('+')) {
    // Must have country code and at least 7 more digits
    return cleaned.length >= 8 && cleaned.length <= 15;
  }

  // US format (10 digits)
  if (/^\d{10}$/.test(cleaned)) {
    return true;
  }

  // US format with formatting
  if (/^\(\d{3}\)\s\d{3}-\d{4}$/.test(phone)) {
    return true;
  }

  // Allow 7-15 digits for other formats
  return /^\d{7,15}$/.test(cleaned);
};

/**
 * Get display format for phone number
 * Used for consistent display in lists
 */
export const getPhoneDisplay = (phone: string): string => {
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Already formatted international
  if (phone.startsWith('+')) {
    return phone;
  }

  // Format US numbers
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return formatPhoneNumber(cleaned);
  }

  return phone;
};
