// These follow the guideline of "How to format amounts"
// https://github.com/5afe/safe/wiki/How-to-format-amounts

const LOWER_LIMIT = 0.00001
const COMPACT_LIMIT = 99_999_999.5
const UPPER_LIMIT = 999 * 10 ** 12

const getNumberFormatMaxFractionDigits = (float: number): Intl.NumberFormatOptions['maximumFractionDigits'] => {
  if (float < 1_000) {
    return 5
  }

  if (float < 10_000) {
    return 4
  }

  if (float < 100_000) {
    return 3
  }

  if (float < 1_000_000) {
    return 2
  }

  if (float < 10_000_000) {
    return 1
  }

  if (float < COMPACT_LIMIT) {
    return 0
  }

  // to represent numbers like 767.343M
  if (float < UPPER_LIMIT) {
    return 3
  }

  return 0
}

const getNumberFormatNotation = (float: number): Intl.NumberFormatOptions['notation'] => {
  return float >= COMPACT_LIMIT ? 'compact' : undefined
}

const getNumberFormatterOptions = (float: number): Intl.NumberFormatOptions => {
  return {
    maximumFractionDigits: getNumberFormatMaxFractionDigits(float),
    notation: getNumberFormatNotation(float),
  }
}

const getCurrencyFormatterOptions = (float: number, currency: string): Intl.NumberFormatOptions => {
  return {
    notation: getNumberFormatNotation(float),
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }
}

const formatNumber = (float: number, options: Intl.NumberFormatOptions, keepSign?: boolean): string => {
  const formatter = new Intl.NumberFormat(undefined, options)

  if (float === 0) {
    return formatter.format(float)
  }

  if (Math.abs(float) < LOWER_LIMIT) {
    const sign = keepSign && Math.sign(float) > 0 ? '+' : Math.sign(float) < 0 ? '-' : ''
    return `< ${sign}${formatter.format(LOWER_LIMIT)}`
  }

  if (float < UPPER_LIMIT) {
    return formatter.format(float)
  }

  return `> ${formatter.format(UPPER_LIMIT)}`
}

export const formatAmount = (number: string | number): string => {
  // to keep the '+' sign, pass the amount as a string
  const keepSign = typeof number === 'string' && number.trim().startsWith('+')
  const float = Number(number)
  const options = getNumberFormatterOptions(float)
  return formatNumber(float, options, keepSign)
}

export const formatAmountWithPrecision = (number: string | number, fractionDigits: number): string => {
  const float = Number(number)
  const options = getNumberFormatterOptions(float)
  return formatNumber(float, { ...options, maximumFractionDigits: fractionDigits })
}

export const formatCurrency = (number: string | number, currency: string): string => {
  const float = Number(number)
  const options = getCurrencyFormatterOptions(float, currency)
  return formatNumber(float, options)
}
