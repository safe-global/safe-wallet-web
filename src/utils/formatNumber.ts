// These follow the guideline of "How to format amounts"
// https://github.com/5afe/safe/wiki/How-to-format-amounts

const LOWER_LIMIT = 0.00001
const COMPACT_LIMIT = 99_999_999.5
const UPPER_LIMIT = 999 * 10 ** 12

// Universal amount formatting options

/**
 * Numbers aboive 99,999,999 use compact notation, e.g. 100M
 * @param number Number to format
 */
const getNumberFormatNotation = (number: string | number): Intl.NumberFormatOptions['notation'] => {
  const float = Number(number)

  return float >= COMPACT_LIMIT ? 'compact' : undefined
}

/**
 * Numbers either with a +/- sign or that are negative are prepended with their relevant sign (when not 0)
 * @param number Number to prepend sign to
 */
const getNumberFormatSignDisplay = (number: string | number): Intl.NumberFormatOptions['signDisplay'] => {
  const float = Number(number)

  const shouldDisplaySign =
    typeof number === 'string' ? number.includes('+') || number.includes('-') : Math.sign(float) === -1

  return shouldDisplaySign ? 'exceptZero' : undefined
}

// Short amount formatting options

/**
 * Numbers of a above/below a certain value are rounded to differing decimal places
 * @param number Number to round
 */
const getNumberFormatMaxFractionDigits = (
  number: string | number,
): Intl.NumberFormatOptions['maximumFractionDigits'] => {
  const float = Number(number)

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

  // Represents numbers like 767.343M
  if (float < UPPER_LIMIT) {
    return 3
  }

  return 0
}

/**
 * Formatter that restricts the upper and lower limit of numbers that can be formatted
 * @param number Number to format
 * @param formatter Function to format number
 * @param hasMaximumFractionDigits Whether the provided number is to be restricted to a certain number of decimal places
 */
const format = (number: string | number, formatter: (float: number) => string, hasMaximumFractionDigits: boolean) => {
  const float = Number(number)

  if (float === 0) {
    return formatter(float)
  }

  if (hasMaximumFractionDigits && Math.abs(float) < LOWER_LIMIT) {
    return `< ${formatter(LOWER_LIMIT * Math.sign(float))}`
  }

  if (float < UPPER_LIMIT) {
    return formatter(float)
  }

  return `> ${formatter(UPPER_LIMIT)}`
}

// Fiat formatting

/**
 * Intl.NumberFormatOptions for currency formatting
 * @param number Number to format
 * @param currency ISO 4217 currency code
 */
const getCurrencyFormatterOptions = (number: string | number, currency: string): Intl.NumberFormatOptions => {
  return {
    notation: getNumberFormatNotation(number),
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    signDisplay: getNumberFormatSignDisplay(number),
  }
}

/**
 * Currency formatter that appends the currency code
 * @param number Number to format
 * @param currency ISO 4217 currency code
 */
export const formatCurrency = (number: string | number, currency: string): string => {
  const options = getCurrencyFormatterOptions(number, currency)

  const currencyFormatter = (float: number): string => {
    const formatter = new Intl.NumberFormat(undefined, options)

    const amount = formatter
      .formatToParts(float) // Returns an array of objects with `type` and `value` properties
      .filter(({ type }) => type !== 'currency')
      .reduce((acc, { value }) => acc + value, '')
      .trim()

    return `${amount} ${currency.toUpperCase()}`
  }

  // We format currency to currency precision, not `maximumFractionDigits`
  return format(number, currencyFormatter, false)
}

// Amount formatting

/**
 * Intl.NumberFormatOptions for number formatting
 * @param number Number to format
 */
const getNumberFormatterOptions = (number: string | number): Intl.NumberFormatOptions => {
  return {
    maximumFractionDigits: getNumberFormatMaxFractionDigits(number),
    notation: getNumberFormatNotation(number),
    signDisplay: getNumberFormatSignDisplay(number),
  }
}

/**
 * Universal Intl.NumberFormat number formatter
 * @param number Number to format
 * @param options Intl.NumberFormatOptions
 */
const formatNumber = (number: string | number, options: Intl.NumberFormatOptions): string => {
  const numberFormatter = new Intl.NumberFormat(undefined, options).format

  const hasMaximumFractionDigits = typeof options.maximumFractionDigits !== 'undefined'
  return format(number, numberFormatter, hasMaximumFractionDigits)
}

/**
 * Intl.NumberFormat number formatter that adheres to our style guide
 * @param number Number to format
 */
export const formatAmount = (number: string | number): string => {
  const options = getNumberFormatterOptions(number)
  return formatNumber(number, options)
}

/**
 * Intl.NumberFormat number formatter that adheres to our style guide with custom decimal places
 * @param number Number to format
 */
export const formatAmountWithPrecision = (
  number: string | number,
  fractionDigits: Intl.NumberFormatOptions['maximumFractionDigits'],
): string => {
  const options = getNumberFormatterOptions(number)
  return formatNumber(number, { ...options, maximumFractionDigits: fractionDigits })
}
