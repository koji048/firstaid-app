import {
  formatPhoneNumber,
  getPhoneDisplay,
  validatePhoneNumber,
} from '../../src/utils/phoneNumber';

describe('phoneNumber utils', () => {
  describe('formatPhoneNumber', () => {
    it('formats US phone numbers correctly', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('123456')).toBe('(123) 456');
      expect(formatPhoneNumber('123')).toBe('(123)');
      expect(formatPhoneNumber('12')).toBe('12');
    });

    it('preserves international format', () => {
      expect(formatPhoneNumber('+1234567890')).toBe('+1234567890');
      expect(formatPhoneNumber('+44 20 7946 0958')).toBe('+442079460958');
    });

    it('removes non-digit characters except +', () => {
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('123.456.7890')).toBe('(123) 456-7890');
    });
  });

  describe('validatePhoneNumber', () => {
    it('validates US phone numbers', () => {
      expect(validatePhoneNumber('(123) 456-7890')).toBe(true);
      expect(validatePhoneNumber('1234567890')).toBe(true);
      expect(validatePhoneNumber('123456789')).toBe(false); // Too short
      expect(validatePhoneNumber('12345678901')).toBe(false); // Too long
    });

    it('validates international phone numbers', () => {
      expect(validatePhoneNumber('+1234567890')).toBe(true);
      expect(validatePhoneNumber('+442079460958')).toBe(true);
      expect(validatePhoneNumber('+123456')).toBe(false); // Too short
      expect(validatePhoneNumber('+1234567890123456')).toBe(false); // Too long
    });

    it('validates other formats', () => {
      expect(validatePhoneNumber('1234567')).toBe(true); // 7 digits
      expect(validatePhoneNumber('123456789012345')).toBe(true); // 15 digits
      expect(validatePhoneNumber('123456')).toBe(false); // Too short
      expect(validatePhoneNumber('1234567890123456')).toBe(false); // Too long
    });
  });

  describe('getPhoneDisplay', () => {
    it('returns formatted US numbers', () => {
      expect(getPhoneDisplay('1234567890')).toBe('(123) 456-7890');
    });

    it('preserves international format', () => {
      expect(getPhoneDisplay('+1234567890')).toBe('+1234567890');
    });

    it('returns original for non-standard formats', () => {
      expect(getPhoneDisplay('123-456')).toBe('123-456');
      expect(getPhoneDisplay('12345')).toBe('12345');
    });
  });
});
