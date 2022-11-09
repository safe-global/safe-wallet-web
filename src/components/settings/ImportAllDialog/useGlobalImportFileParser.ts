import { migrateAddedSafes } from '@/services/ls-migration/addedSafes'
import { migrateAddressBook } from '@/services/ls-migration/addressBook'
import { useMemo } from 'react'

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

      const abData = migrateAddressBook(parsedFile)
      const addedSafesData = migrateAddedSafes(parsedFile)

      let abCount = 0
      let addedSafesCount = 0
      if (abData) {
        Object.keys(abData).forEach((chainKey) => {
          const chainData = abData[chainKey]
          abCount += Object.keys(chainData).length
        })
      }

      if (addedSafesData) {
        Object.keys(addedSafesData).forEach((chainKey) => {
          const chainData = addedSafesData[chainKey]
          addedSafesCount += Object.keys(chainData).length
        })
      }

      return [addedSafesData, abData, abCount, addedSafesCount]
    } catch (err) {
      console.error(err)
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
