import { useEffect } from 'react'
import useLocalStorage from '@/services/localStorage/useLocalStorage'
import { useAppDispatch } from '@/store'
import { addressBookSlice } from '@/store/addressBookSlice'
import { addedSafesSlice } from '@/store/addedSafesSlice'
import { migrateAddressBook } from './addressBook'
import { migrateAddedSafes } from './addedSafes'
import { LOCAL_STORAGE_DATA } from './common'
import createMigrationBus from './migrationBus'
import { MIGRATION_KEY } from './config'

const useStorageMigration = (): void => {
  const dispatch = useAppDispatch()
  const [isMigrationFinished, setIsMigrationFinished] = useLocalStorage<boolean | undefined>(MIGRATION_KEY, false)

  useEffect(() => {
    if (isMigrationFinished) return

    const unmount = createMigrationBus((lsData: LOCAL_STORAGE_DATA) => {
      const abData = migrateAddressBook(lsData)
      if (abData) {
        dispatch(addressBookSlice.actions.setAddressBook(abData))
      }

      const addedSafesData = migrateAddedSafes(lsData)
      if (addedSafesData) {
        dispatch(addedSafesSlice.actions.set(addedSafesData))
      }

      setIsMigrationFinished(true)
      unmount()
    })

    return unmount
  }, [isMigrationFinished, setIsMigrationFinished])
}

export default useStorageMigration
