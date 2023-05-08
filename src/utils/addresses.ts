import { getAddress } from 'ethers/lib/utils'
import { isAddress } from '@ethersproject/address'

export const checksumAddress = (address: string): string => {
  return isAddress(address) ? getAddress(address) : address
}

export const isChecksummedAddress = (address: string): boolean => {
  if (!isAddress(address)) {
    return false
  }

  try {
    return getAddress(address) === address
  } catch {
    return false
  }
}

export const sameAddress = (firstAddress: string | undefined, secondAddress: string | undefined): boolean => {
  if (!firstAddress || !secondAddress) {
    return false
  }

  return firstAddress.toLowerCase() === secondAddress.toLowerCase()
}

export type PrefixedAddress = {
  prefix?: string
  address: string
}

/**
 * Parses a string that may/may not contain an address and returns the `prefix` and checksummed `address`
 * @param value (prefixed) address
 * @returns `prefix` and checksummed `address`
 */
export const parsePrefixedAddress = (value: string): PrefixedAddress => {
  let [prefix, address] = value.split(':')

  if (!address) {
    address = value
    prefix = ''
  }

  return {
    prefix: prefix || undefined,
    address: checksumAddress(address),
  }
}

export const formatPrefixedAddress = (address: string, prefix?: string): string => {
  return prefix ? `${prefix}:${address}` : address
}

export const cleanInputValue = (value: string): string => {
  const regex = /(0x[a-fA-F0-9]{40})\b/
  const regexWithPrefix = /([a-zA-Z0-9]+):(0x[a-fA-F0-9]{40})\b/

  // if value matches the regex with prefix, return the match with prefix
  if (regexWithPrefix.test(value)) {
    return value.match(regexWithPrefix)?.[0] || value
  }
  // if value matches the regex without prefix, return the match
  if (regex.test(value)) {
    return `${value.match(regex)?.[0]}`
  }
  // if no match, return the original value
  return value
}
