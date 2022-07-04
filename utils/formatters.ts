import { BigNumberish, type BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

const formatter = new Intl.NumberFormat([], {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 8,
})

export const formatDecimals = (value: BigNumberish, decimals?: number | string): string => {
  return formatter.format(Number(formatUnits(value, decimals)))
}

export const toDecimals = (value: string, decimals?: number | string): BigNumber => {
  return parseUnits(value, decimals)
}

const GWEI = 'gwei'

export const safeFormatUnits = (value: BigNumberish, decimals: number | string = GWEI): string => {
  try {
    return formatDecimals(value, decimals)
  } catch (err) {
    console.error('Error formatting units', err)
    return ''
  }
}

export const safeParseUnits = (value: string, decimals: number | string = GWEI): BigNumber | undefined => {
  try {
    return parseUnits(value, decimals)
  } catch (err) {
    console.error('Error parsing units', err)
    return
  }
}

export const shortenAddress = (address: string, length = 4): string => {
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
}

export const shortenText = (text: string, length = 10, separator = '...'): string => {
  return `${text.slice(0, length)}${separator}`
}

export const dateString = (date: number) => {
  const formatterOptions: Intl.DateTimeFormatOptions = {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }
  return new Intl.DateTimeFormat(undefined, formatterOptions).format(new Date(date))
}

export const camelCaseToSpaces = (str: string): string => {
  return str
    .replace(/([A-Z][a-z0-9]+)/g, ' $1 ')
    .replace(/\s{2}/g, ' ')
    .trim()
}

const LOWER_LIMIT = 0.001
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

  return undefined
}

const getNumberFormatNotation = (float: number): Intl.NumberFormatOptions['notation'] => {
  return float < COMPACT_LIMIT ? undefined : 'compact'
}

export const _getNumberFormatterOptions = (float: number) => {
  return {
    maximumFractionDigits: getNumberFormatMaxFractionDigits(float),
    notation: getNumberFormatNotation(float),
  }
}

export const _getCurrencyFormatterOptions = (float: number, currency: string): Intl.NumberFormatOptions => {
  return {
    notation: getNumberFormatNotation(float),
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }
}

const formatNumber = (float: number, options: Intl.NumberFormatOptions): string => {
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

  return `> ${formatter.format(UPPER_LIMIT)}`
}

export const formatAmount = (number: string | number): string => {
  const float = Number(number)
  const options = _getNumberFormatterOptions(float)
  return formatNumber(float, options)
}

export const formatCurrency = (number: string | number, currency: string): string => {
  const float = Number(number)
  const options = _getCurrencyFormatterOptions(float, currency)
  return formatNumber(float, options)
}
