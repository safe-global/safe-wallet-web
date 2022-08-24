import { BigNumberish, type BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { formatAmount } from './formatNumber'

const GWEI = 'gwei'

// safeFormatUnits => "0.000000000001"
export const safeFormatUnits = (value: BigNumberish, decimals: number | string = GWEI): string => {
  try {
    const formattedAmount = formatUnits(value, decimals)

    // FIXME: Temporary fix to as ethers' `formatFixed` doesn't strip trailing 0s
    // https://github.com/5afe/safe/wiki/How-to-format-amounts
    return parseFloat(formattedAmount).toString()
  } catch (err) {
    console.error('Error formatting units', err)
    return ''
  }
}

// safeFormatAmount => -< 0.00001
export const safeFormatAmount = (value: BigNumberish, decimals: number | string = GWEI): string => {
  return formatAmount(safeFormatUnits(value, decimals))
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

export const ellipsis = (str: string, length: number): string => {
  return str.length > length ? `${str.slice(0, length)}...` : str
}
