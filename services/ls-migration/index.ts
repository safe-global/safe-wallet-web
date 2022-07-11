import { migrateAddressBook } from './addressBook'
import { migrateAddedSafes } from './addedSafes'
import { LOCAL_STORAGE_DATA } from './common'

const migrateLocalStorage = (lsData: LOCAL_STORAGE_DATA): void => {
  migrateAddressBook(lsData)
  migrateAddedSafes(lsData)
}

export default migrateLocalStorage
