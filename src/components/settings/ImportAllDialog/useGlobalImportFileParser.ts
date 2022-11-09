import { logError } from '@/services/exceptions'
import ErrorCodes from '@/services/exceptions/ErrorCodes'
import { migrateAddedSafes } from '@/services/ls-migration/addedSafes'
import { migrateAddressBook } from '@/services/ls-migration/addressBook'
import { useMemo } from 'react'

const V1 = '1.0'

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
  const [migrationAddedSafes, migrationAddressbook, addressBookEntriesCount, addedSafesCount] = useMemo(() => {
    if (!jsonData) {
      return [undefined, undefined, 0, 0]
    }
    try {
      const parsedFile = JSON.parse(jsonData)

      // We only understand v1 data so far
      if (parsedFile.version !== V1) {
        return [undefined, undefined, 0, 0]
      }

      const abData = migrateAddressBook(parsedFile.data)
      const addedSafesData = migrateAddedSafes(parsedFile.data)

      const abCount = abData ? countEntries(abData) : 0
      const addedSafesCount = addedSafesData ? countEntries(addedSafesData) : 0

      return [addedSafesData, abData, abCount, addedSafesCount]
    } catch (err) {
      logError(ErrorCodes._704, (err as Error).message)
      return [undefined, undefined, 0, 0]
    }
  }, [jsonData])

  return {
    addedSafes: migrationAddedSafes,
    addressBook: migrationAddressbook,
    addressBookEntriesCount,
    addedSafesCount,
  }
}
