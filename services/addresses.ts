import { sameString } from '@/utils/strings'

export const sameAddress = (firstAddress: string | undefined, secondAddress: string | undefined): boolean => {
  return sameString(firstAddress, secondAddress)
}
