import { useEffect } from 'react'
import { getPersistedState, type makeStore } from '@/store'

export const HYDRATE_ACTION = '@@HYDRATE'

export const useHydrateStore = (store: ReturnType<typeof makeStore>) => {
  useEffect(() => {
    store.dispatch({
      type: HYDRATE_ACTION,
      payload: getPersistedState(),
    })
  }, [store])
}
