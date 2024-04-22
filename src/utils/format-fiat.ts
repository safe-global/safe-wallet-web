export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    notation: 'compact',
    compactDisplay: 'short',
  }).format(Number(amount))
}
