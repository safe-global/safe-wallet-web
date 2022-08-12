// These follow the guideline of "How to format amounts"
// https://github.com/5afe/safe/wiki/How-to-format-amounts

const LOWER_LIMIT = 0.00001
const COMPACT_LIMIT = 100_000_000
const UPPER_LIMIT = 10 ** 15

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

  if (float < UPPER_LIMIT) {
    return 3
  }

  return 0
}

const getNumberFormatNotation = (float: number): Intl.NumberFormatOptions['notation'] => {
  return float < COMPACT_LIMIT ? undefined : 'compact'
}

const getNumberFormatterOptions = (float: number) => {
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

// TODO: Add signs in reference to final point of number formatting
const formatNumber = (float: number, options: Intl.NumberFormatOptions): string => {
  const VISIBLE_UPPER_LIMIT = 999 * 10 ** 12 // 999T

  const formatter = new Intl.NumberFormat(undefined, options)

  if (float === 0) {
    return formatter.format(float)
  }

  if (float < LOWER_LIMIT) {
    return `< ${formatter.format(LOWER_LIMIT)}`
  }

  if (float < UPPER_LIMIT) {
    return formatter.format(float)
  }

  return `> ${formatter.format(VISIBLE_UPPER_LIMIT)}`
}

export const formatAmount = (number: string | number): string => {
  const float = Number(number)
  const options = getNumberFormatterOptions(float)
  return formatNumber(float, options)
}

export const formatCurrency = (number: string | number, currency: string): string => {
  const float = Number(number)
  const options = getCurrencyFormatterOptions(float, currency)
  return formatNumber(float, options)
}
