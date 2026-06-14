export function formatDate(value?: string | null): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  try {
    return new Intl.NumberFormat('en-IN', {style: 'currency', currency}).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
