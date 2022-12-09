import { logError } from '@/services/exceptions'
import ErrorCodes from '@/services/exceptions/ErrorCodes'
import { migrateAddedSafes } from '@/services/ls-migration/addedSafes'
import { migrateAddressBook } from '@/services/ls-migration/addressBook'
import { useMemo } from 'react'

const V1 = '1.0'

export enum ImportErrors {
  INVALID_VERSION = 'The file is not a Safe export.',
  INVALID_JSON_FORMAT = 'The JSON format is invalid.',
  NO_IMPORT_DATA_FOUND = 'This file contains no importable data.',
}

const countEntries = (data: { [chainId: string]: { [address: string]: unknown } }) =>
  Object.values(data).reduce<number>((count, entry) => count + Object.keys(entry).length, 0)

/**
 * The global import currently imports:
 *  - all addressbook entries
 *  - all addedSafes
 *
 * @param jsonData
 * @returns data to import and some insights about it
 */
export const useGlobalImportJsonParser = (jsonData: string | undefined) => {
  const [migrationAddedSafes, migrationAddressbook, addressBookEntriesCount, addedSafesCount, error] = useMemo(() => {
    if (!jsonData) {
      return [undefined, undefined, 0, 0, undefined]
    }
    try {
      const parsedFile = JSON.parse(jsonData)

      // We only understand v1 data so far
      if (!parsedFile.data || parsedFile.version !== V1) {
        return [undefined, undefined, 0, 0, ImportErrors.INVALID_VERSION]
      }

      const abData = migrateAddressBook(parsedFile.data)
      const addedSafesData = migrateAddedSafes(parsedFile.data)

      const abCount = abData ? countEntries(abData) : 0
      const addedSafesCount = addedSafesData ? countEntries(addedSafesData) : 0

      return [
        addedSafesData,
        abData,
        abCount,
        addedSafesCount,
        !abData && !addedSafesData ? ImportErrors.NO_IMPORT_DATA_FOUND : undefined,
      ]
    } catch (err) {
      logError(ErrorCodes._704, (err as Error).message)
      return [undefined, undefined, 0, 0, ImportErrors.INVALID_JSON_FORMAT]
    }
  }, [jsonData])

  return {
    addedSafes: migrationAddedSafes,
    addressBook: migrationAddressbook,
    addressBookEntriesCount,
    addedSafesCount,
    error,
  }
}
