import Storage from './Storage'

const session = new Storage(typeof window !== 'undefined' ? window.sessionStorage : undefined)

export const sessionItem = <T>(key: string) => ({
  get: () => session.getItem<T>(key),
  set: (value: T) => session.setItem<T>(key, value),
  remove: () => session.removeItem(key),
})

export default session
