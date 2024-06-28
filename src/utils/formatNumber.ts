const locale = typeof navigator !== 'undefined' ? navigator.language : undefined

/**
 * Intl.NumberFormat number formatter that adheres to our style guide
 * @param number Number to format
 */
export const formatAmount = (number: string | number, precision = 5, maxLength = 6): string => {
  const float = Number(number)
  if (float === 0) return '0'
  if (float === Math.round(float)) precision = 0
  if (Math.abs(float) < 0.00001) return '< 0.00001'

  const fullNum = new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: precision,
  }).format(float)

  // +3 for the decimal point and the two decimal places
  if (fullNum.length <= maxLength + 3) return fullNum

  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(float)
}

/**
 * Returns a formatted number with a defined precision not adhering to our style guide compact notation
 * @param number Number to format
 * @param precision Fraction digits to show
 */
export const formatAmountPrecise = (number: string | number, precision?: number): string => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: precision,
  }).format(Number(number))
}

/**
 * Currency formatter that appends the currency code
 * @param number Number to format
 * @param currency ISO 4217 currency code
 */
export const formatCurrency = (number: string | number, currency: string, maxLength = 6): string => {
  let float = Number(number)

  let result = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: Math.abs(float) >= 1 || float === 0 ? 0 : 2,
  }).format(float)

  // +1 for the currency symbol
  if (result.length > maxLength + 1) {
    result = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(float)
  }

  return result.replace(/^(\D+)/, '$1 ')
}
