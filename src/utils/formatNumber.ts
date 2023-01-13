import { memoize } from 'lodash'

// These follow the guideline of "How to format amounts"
// https://github.com/5afe/safe/wiki/How-to-format-amounts

const LOWER_LIMIT = 0.00001
const COMPACT_LIMIT = 99_999_999.5
const UPPER_LIMIT = 999 * 10 ** 12

/**
 * Formatter that restricts the upper and lower limit of numbers that can be formatted
 * @param number Number to format
 * @param formatter Function to format number
 * @param minimum Minimum number to format
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

// Universal amount formatting options

const getNumberFormatNotation = (number: string | number): Intl.NumberFormatOptions['notation'] => {
  return Number(number) >= COMPACT_LIMIT ? 'compact' : undefined
}

const getNumberFormatSignDisplay = (number: string | number): Intl.NumberFormatOptions['signDisplay'] => {
  const shouldDisplaySign = typeof number === 'string' ? number.trim().startsWith('+') : Number(number) < 0
  return shouldDisplaySign ? 'exceptZero' : undefined
}

// Amount formatting options

const getAmountFormatterMaxFractionDigits = (
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

const getAmountFormatterOptions = (number: string | number): Intl.NumberFormatOptions => {
  return {
    maximumFractionDigits: getAmountFormatterMaxFractionDigits(number),
    notation: getNumberFormatNotation(number),
    signDisplay: getNumberFormatSignDisplay(number),
  }
}

/**
 * Intl.NumberFormat number formatter that adheres to our style guide
 * @param number Number to format
 */
export const formatAmount = (number: string | number, precision?: number): string => {
  const options = getAmountFormatterOptions(number)
  if (precision !== undefined) {
    options.maximumFractionDigits = precision
  }
  const formatter = new Intl.NumberFormat(undefined, options)

  return format(number, formatter.format)
}

/**
 * Returns a formatted number with a defined precision not adhering to our style guide compact notation
 * @param number Number to format
 * @param precision Fraction digits to show
 */
export const formatAmountPrecise = (number: string | number, precision: number): string => {
  const float = Number(number)

  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: precision,
  })

  return formatter.format(float)
}

// Fiat formatting

const getMinimumCurrencyDenominator = memoize((currency: string): number => {
  const BASE_VALUE = 1

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  })

  const fraction = formatter.formatToParts(BASE_VALUE).find(({ type }) => type === 'fraction')

  // Currencies may not have decimals, i.e. JPY
  return fraction ? Number(`0.${'1'.padStart(fraction.value.length, '0')}`) : 1
})

const getCurrencyFormatterMaxFractionDigits = (
  number: string | number,
  currency: string,
): Intl.NumberFormatOptions['maximumFractionDigits'] => {
  const float = Number(number)

  if (float < 1_000_000) {
    const [, decimals] = getMinimumCurrencyDenominator(currency).toString().split('.')
    return decimals?.length ?? 0
  }

  // Represents numbers like 767.343M
  if (float < UPPER_LIMIT) {
    return 3
  }

  return 0
}

const getCurrencyFormatterOptions = (number: string | number, currency: string): Intl.NumberFormatOptions => {
  return {
    maximumFractionDigits: getCurrencyFormatterMaxFractionDigits(number, currency),
    notation: getNumberFormatNotation(number),
    signDisplay: getNumberFormatSignDisplay(number),
    style: 'currency',
    currency,
    currencyDisplay: 'code',
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

  const minimum = getMinimumCurrencyDenominator(currency)

  const currencyFormatter = (float: number): string => {
    const options = getCurrencyFormatterOptions(number, currency)
    const formatter = new Intl.NumberFormat(undefined, options)

    const parts = formatter.formatToParts(float) // Returns an array of objects with `type` and `value` properties

    const fraction = parts.find(({ type }) => type === 'fraction')

    const amount = parts
      .filter(({ type }) => type !== 'currency' && type !== 'literal') // Remove currency code and whitespace
      .map((part) => {
        if (float >= 0) {
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
