import { useEffect } from 'react'
import { IS_PRODUCTION } from '@/config/constants'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useAppDispatch } from '@/store'
import { addressBookSlice } from '@/store/addressBookSlice'
import { addedSafesSlice } from '@/store/addedSafesSlice'
import { migrateAddressBook } from './addressBook'
import { migrateAddedSafes } from './addedSafes'
import type { LOCAL_STORAGE_DATA } from './common'
import createMigrationBus from './migrationBus'
import { MIGRATION_KEY } from './config'

const useStorageMigration = (): void => {
  const dispatch = useAppDispatch()
  const [isMigrationFinished = false, setIsMigrationFinished] = useLocalStorage<boolean>(MIGRATION_KEY)

  useEffect(() => {
    if (isMigrationFinished) return

    const unmount = createMigrationBus((lsData: LOCAL_STORAGE_DATA) => {
      const abData = migrateAddressBook(lsData)
      if (abData) {
        dispatch(addressBookSlice.actions.migrate(abData))
      }

      const addedSafesData = migrateAddedSafes(lsData)
      if (addedSafesData) {
        dispatch(addedSafesSlice.actions.migrate(addedSafesData))
      }

      setIsMigrationFinished(true)
      unmount()
    })

    return unmount
  }, [isMigrationFinished, setIsMigrationFinished, dispatch])
}

export default IS_PRODUCTION ? useStorageMigration : () => void null
