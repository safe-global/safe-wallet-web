import { localItem } from '@/services/local-storage/local'
import useLocalStorage from '@/services/local-storage/useLocalStorage'

const getAbTestKey = (name: string) => {
  return `AB__${name}`
}

export const getAbTestIsB = (name: string) => {
  return localItem<boolean>(getAbTestKey(name)).get()
}

const useABTest = (name: string): boolean => {
  const [isB] = useLocalStorage<boolean>(getAbTestKey(name), Math.random() > 0.5, true)

  return isB
}

export default useABTest
