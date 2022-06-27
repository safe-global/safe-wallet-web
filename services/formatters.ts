import { type BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

const formatter = new Intl.NumberFormat([], {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 8,
})

export const formatDecimals = (value: string, decimals = 18): string => {
  return formatter.format(Number(formatUnits(value, decimals)))
}

export const toDecimals = (value: string, decimals = 18): BigNumber => {
  return parseUnits(value, decimals)
}

export const shortenAddress = (address: string, length = 4): string => {
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
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
