import { asError } from '@/src/services/exceptions/utils'

export async function buildQueryFn<T>(fn: () => Promise<T>) {
  try {
    return { data: await fn() }
  } catch (error) {
    return { error: asError(error) }
  }
}
