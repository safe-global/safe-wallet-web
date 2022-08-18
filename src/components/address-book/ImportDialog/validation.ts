import type { ParseResult } from 'papaparse'

import { validateAddress, validateChainId } from '@/utils/validation'

export const abCsvReaderValidator = ({ type, size }: File): string[] | undefined => {
  if (type !== 'text/csv') {
    return ['Address book must be a CSV file']
  }

  if (size > 1_000_000) {
    return ['Address book cannot be larger than 1MB']
  }
}

export const hasValidAbHeader = (header: string[]) => {
  return header.length === 3 && header[0] === 'address' && header[1] === 'name' && header[2] === 'chainId'
}

export const hasValidAbEntryAddresses = (entries: string[][]) => {
  return entries.every((entry) => entry.length >= 1 && !validateAddress(entry[0]))
}

export const hasValidAbEntryChainIds = (entries: string[][]) => {
  return entries.every((entry) => {
    if (entry.length < 3) {
      return false
    }
    const chainId = entry[2].replace(/\s/g, '')
    return !validateChainId(chainId)
  })
}

export const abOnUploadValidator = ({ data, errors }: ParseResult<string[]>): string | undefined => {
  const [header, ...entries] = data

  // papaparse error
  if (errors.length > 0) {
    return errors[0].message
  }

  // Empty CSV
  if (data.length === 0) {
    return 'CSV file is empty'
  }

  // Wrong header
  if (!hasValidAbHeader(header)) {
    return 'Invalid or corrupt address book'
  }

  // No entries
  if (entries.length === 0) {
    return 'No entries found in address book'
  }

  // An entry has invalid address
  if (!hasValidAbEntryAddresses(entries)) {
    return 'Address book contains invalid addresses'
  }

  // An entry has invalid chainId
  if (!hasValidAbEntryChainIds(entries)) {
    return 'Address book contains invalid chain IDs'
  }
}
