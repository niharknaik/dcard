import {formatCurrency, formatDate, initials} from '@/utils/format';

describe('initials', () => {
  it('takes the first letter of the first two words, uppercased', () => {
    expect(initials('John Doe')).toBe('JD');
    expect(initials('john doe smith')).toBe('JD');
  });

  it('handles single-word names', () => {
    expect(initials('madonna')).toBe('M');
  });

  it('returns an empty string for blank input', () => {
    expect(initials('   ')).toBe('');
    expect(initials('')).toBe('');
  });
});

describe('formatCurrency', () => {
  it('formats INR amounts with grouping', () => {
    // Don't assert the exact symbol — ICU output varies by platform; the
    // grouped number is the stable part.
    expect(formatCurrency(100000)).toContain('1,00,000');
  });

  it('falls back to "<currency> <amount>" on an invalid currency', () => {
    expect(formatCurrency(12.5, 'NOPE')).toBe('NOPE 12.50');
  });
});

describe('formatDate', () => {
  it('returns an empty string for null/undefined/empty', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('renders the year for a valid ISO date', () => {
    expect(formatDate('2024-01-15T00:00:00Z')).toContain('2024');
  });
});
