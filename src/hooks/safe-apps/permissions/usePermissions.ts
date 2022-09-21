import local from '@/services/local-storage/local'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useState, useEffect } from 'react'

const usePermissions = <T>(storageKey: string): [T, (state: T) => void] => {
  const [storage, setStorage] = useLocalStorage<T | {}>(storageKey, local.getItem(storageKey) || {})
  const [permissions, setPermissions] = useState<T>(storage as T)

  useEffect(() => {
    setStorage(permissions)
  }, [permissions, setStorage, storageKey])

  return [permissions, setPermissions]
}

export { usePermissions }
