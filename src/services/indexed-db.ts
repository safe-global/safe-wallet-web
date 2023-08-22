import { createStore } from 'idb-keyval'

export const getCustomStore = (storeName: string) => {
  const DB_NAME = 'safe'

  return createStore(DB_NAME, storeName)
}
