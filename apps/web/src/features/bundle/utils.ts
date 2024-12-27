import { AppRoutes } from '@/config/routes'
import type { BundleEntry } from '@/features/bundle/CreateBundle'

export function createBundleLink(bundle: BundleEntry) {
  const safes = bundle.safes.map((safe) => `${safe.chainId}:${safe.address}`)

  return { pathname: AppRoutes.bundle, query: { name: bundle.name, safes: safes.join(',') } }
}
