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
export const toDecimals = (value: BigNumberish, decimals?: number | string): number => {
  return Number(formatUnits(value, decimals))
}

export const toWei = (value: string, decimals?: number | string): BigNumber => {
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
