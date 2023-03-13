import type { BigNumberish } from 'ethers'
import { type BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { formatAmount } from './formatNumber'

const GWEI = 'gwei'

export const _removeTrailingZeros = (value: string): string => {
  // Match `.000` or `.01000`
  return value.replace(/\.0+$/, '').replace(/(\..*?)0+$/, '$1')
}

/**
 * Converts value to raw, specified decimal precision
 * @param value value in unspecified unit
 * @param decimals decimals of the specified value or unit name
 * @returns value at specified decimals, i.e. 0.000000000000000001
 */
export const safeFormatUnits = (value: BigNumberish, decimals: number | string = GWEI): string => {
  try {
    const formattedAmount = formatUnits(value, decimals)

    // ethers' `formatFixed` doesn't remove trailing 0s and using `parseFloat` can return exponentials
    return _removeTrailingZeros(formattedAmount)
  } catch (err) {
    console.error('Error formatting units', err)
    return ''
  }
}

/**
 * Converts value to formatted (https://github.com/5afe/safe/wiki/How-to-format-amounts), specified decimal precision
 * @param value value in unspecified unit
 * @param decimals decimals of the specified value or unit name
 * @returns value at specified decimals, formatted, i.e. -< 0.00001
 */
export const formatVisualAmount = (
  value: BigNumberish,
  decimals: number | string = GWEI,
  precision?: number,
): string => {
  return formatAmount(safeFormatUnits(value, decimals), precision)
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
  if (!address) {
    return ''
  }

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

export const ellipsis = (str: string, length: number): string => {
  return str.length > length ? `${str.slice(0, length)}...` : str
}

export const capitalize = (str: string): string => {
  return str.slice(0, 1).toUpperCase() + str.slice(1)
}

// Format the error message
export const formatError = (error: Error & { reason?: string }): string => {
  let { reason } = error
  if (!reason) return ''
  if (!reason.endsWith('.')) reason += '.'
  return ` ${capitalize(reason)}`
}
