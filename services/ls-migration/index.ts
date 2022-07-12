import { migrateAddressBook } from './addressBook'
import { migrateAddedSafes } from './addedSafes'
import { LOCAL_STORAGE_DATA } from './common'
import createIframeBus from './iframeBus'

/**
 * Parse the message from iframe as JSON
 */
const parseLsData = (data: string): LOCAL_STORAGE_DATA | undefined => {
  try {
    const parsed = JSON.parse(data)
    if (typeof parsed === 'object') {
      return parsed as LOCAL_STORAGE_DATA
    }
  } catch (e) {
    console.error('Failed to parse migration data', data)
    return
  }
}

/**
 * Subscribe to the message from iframe and migrate the data
 */
const migrateLocalStorage = () => {
  createIframeBus((message: string) => {
    const lsData = parseLsData(message)

    if (lsData) {
      migrateAddressBook(lsData)
      migrateAddedSafes(lsData)
    }
  })
}

export default migrateLocalStorage
