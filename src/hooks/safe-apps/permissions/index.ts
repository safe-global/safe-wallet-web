import { RestrictedMethods } from '@gnosis.pm/safe-apps-sdk'
import { AllowedFeatures } from '@/components/safe-apps/types'

type PermissionsDisplayType = {
  displayName: string
  description: string
}

export * from './useBrowserPermissions'
export * from './useSafePermissions'

const SAFE_PERMISSIONS_TEXTS: Record<string, PermissionsDisplayType> = {
  [RestrictedMethods.requestAddressBook]: {
    displayName: 'Address Book',
    description: 'Access to your address book',
  },
}

export const getSafePermissionDisplayValues = (method: string) => {
  return SAFE_PERMISSIONS_TEXTS[method]
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const getBrowserPermissionDisplayValues = (feature: AllowedFeatures) => {
  return {
    displayName: capitalize(feature),
    description: `Allow to use - ${feature}`,
  }
}
