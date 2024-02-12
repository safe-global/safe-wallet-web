import { useEffect } from 'react'
import { store, getPersistedState } from '@/store'

export const HYDRATE_ACTION = '@@HYDRATE'

export const useHydrateStore = () => {
  useEffect(() => {
    store.dispatch({
      type: HYDRATE_ACTION,
      payload: getPersistedState(),
    })
  }, [])
}
