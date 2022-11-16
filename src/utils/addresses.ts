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
