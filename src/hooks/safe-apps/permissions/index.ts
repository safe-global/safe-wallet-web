import { Methods, RestrictedMethods } from '@gnosis.pm/safe-apps-sdk'
import { AllowedFeatures } from '@/components/safe-apps/types'

type PermissionsDisplayType = {
  displayName: string
  description: string
}

export * from './useBrowserPermissions'
export * from './useSafePermissions'

export const SAFE_PERMISSIONS_TEXTS: Record<string, PermissionsDisplayType> = {
  [RestrictedMethods.requestAddressBook]: {
    displayName: 'Address Book',
    description: 'Access to your address book',
  },
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const BROWSER_PERMISSIONS_TEXTS = Object.values(AllowedFeatures).reduce(
  (acc: Record<string, PermissionsDisplayType>, feature: string | AllowedFeatures) => {
    acc[feature] = {
      displayName: capitalize(feature.toString()),
      description: capitalize(feature.toString()),
    }

    return acc
  },
  {},
)
