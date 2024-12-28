import { AppRoutes } from '@/config/routes'
import type { Bundle } from '@/features/bundle/bundleSlice'

export function createBundleLink(bundle: Bundle) {
  const safes = bundle.safes.map((safe) => `${safe.chainId}:${safe.address}`)

  return { pathname: AppRoutes.bundle, query: { name: bundle.name, safes: safes.join(',') } }
}
