import { migrateAddressBook } from './addressBook'
import { migrateAddedSafes } from './addedSafes'
import { LOCAL_STORAGE_DATA } from './common'
import createMigrationBus from './migrationBus'

/**
 * Subscribe to the message from iframe and migrate the data
 */
const migrateLocalStorage = () => {
  createMigrationBus((lsData: LOCAL_STORAGE_DATA) => {
    migrateAddressBook(lsData)
    migrateAddedSafes(lsData)
  })
}

// Run immediately on import
if (typeof window !== 'undefined') {
  migrateLocalStorage()
}

export default undefined
