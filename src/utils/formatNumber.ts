// These follow the guideline of "How to format amounts"
// https://github.com/5afe/safe/wiki/How-to-format-amounts

const LOWER_LIMIT = 0.00001
const COMPACT_LIMIT = 99_999_999.5
const UPPER_LIMIT = 999 * 10 ** 12

// Universal amount formatting options

/**
 * Numbers above 99,999,999 use compact notation, e.g. 100M
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
  const shouldDisplaySign = typeof number === 'string' ? number.trim().startsWith('+') : Number(number) < 0

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
const format = (number: string | number, formatter: (float: number) => string, minimum = LOWER_LIMIT) => {
  const float = Number(number)

  if (float === 0) {
    return formatter(float)
  }

  if (Math.abs(float) < minimum) {
    return `< ${formatter(minimum * Math.sign(float))}`
  }

  if (float < UPPER_LIMIT) {
    return formatter(float)
  }

  return `> ${formatter(UPPER_LIMIT)}`
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

  return format(number, numberFormatter)
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

// Fiat formatting

/**
 * Leverage Intl.NumberFormat to retrieve minimum demonination of a currency
 * @param number Value of currency
 * @param currency ISO 4217 currency code
 */
const getMinimumCurrencyDenominator = (number: string | number, currency: string): number => {
  const float = Number(number)

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  })

  const fraction = formatter.formatToParts(float).find(({ type }) => type === 'fraction')

  // Currencies may not have decimals, i.e. JPY
  return fraction ? Number(`0.${'1'.padStart(fraction.value.length, '0')}`) : 1
}

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
  // Note: we will be able to achieve the following once the `roundingMode` option is supported
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#parameters

  const minimum = getMinimumCurrencyDenominator(number, currency)

  const currencyFormatter = (float: number): string => {
    const options = getCurrencyFormatterOptions(number, currency)
    const formatter = new Intl.NumberFormat(undefined, options)

    const parts = formatter.formatToParts(float) // Returns an array of objects with `type` and `value` properties

    const fraction = parts.find(({ type }) => type === 'fraction')

    const amount = parts
      .filter(({ type }) => type !== 'currency' && type !== 'literal') // Remove currency code and whitespace
      .map((part) => {
        if (float >= minimum) {
          return part
        }

        if (fraction && part.type === 'fraction') {
          return { ...part, value: '1'.padStart(fraction.value.length, '0') }
        }

        if (!fraction && part.type === 'integer') {
          return { ...part, value: minimum.toString() }
        }

        return part
      })
      .reduce((acc, { value }) => acc + value, '')
      .trim()

    return `${amount} ${currency.toUpperCase()}`
  }

  return format(number, currencyFormatter, minimum)
}
