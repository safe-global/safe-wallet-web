import useSafeInfo from '@/hooks/useSafeInfo'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { NotificationsTokenVersion } from '@/services/push-notifications/preferences'
import { NotifiableSafes } from '../logic'

const NOTIFICATIONS_TOKEN_VERSION_KEY = 'notificationsTokenVersion'

type TokenVersionStore = {
  [chainId: string]: {
    [safeAddress: string]: NotificationsTokenVersion | undefined
  }
}

/**
 * Hook to get and update the token versions for the notifications in the local storage.
 * @returns an object with the token version for the current loaded Safe, all token versions stored in the local storage,
 * and a function to update the token version.
 */
export const useNotificationsTokenVersion = () => {
  const { safe, safeLoaded } = useSafeInfo()
  const safeAddress = safe.address.value

  // Token versions are stored in local storage
  const [allTokenVersions, setAllTokenVersionsStore] = useLocalStorage<TokenVersionStore>(
    NOTIFICATIONS_TOKEN_VERSION_KEY,
  )

  /**
   * Updates the token version for the specified Safes in the local storage.
   * @param tokenVersion new token version
   * @param safes object with Safes to update the token version. If not provided, the token version will be
   * updated for the current loaded Safe only.
   */
  const setTokenVersion = (
    tokenVersion: NotificationsTokenVersion | undefined,
    safes: NotifiableSafes | undefined = safeLoaded ? { [safe.chainId]: [safeAddress] } : undefined,
  ) => {
    const currentTokenVersionStore = allTokenVersions || {}

    if (!safes) {
      // No Safes provided and no Safe loaded, nothing to update
      return
    }

    // Update the token version for the provided Safes
    const newTokenVersionStore = Object.keys(safes).reduce(
      (acc, chainId) => ({
        ...acc,
        [chainId]: {
          ...(acc[chainId] || {}),
          ...Object.fromEntries(safes[chainId].map((safeAddress) => [safeAddress, tokenVersion])),
        },
      }),
      currentTokenVersionStore,
    )

    setAllTokenVersionsStore(newTokenVersionStore)
  }

  if (!allTokenVersions) {
    // No token versions stored
    return { safeTokenVersion: undefined, allTokenVersions, setTokenVersion }
  }

  // Get the stored token version for the current loaded Safe
  const safeTokenVersion = safeLoaded ? allTokenVersions[safe.chainId]?.[safeAddress] : undefined

  return { safeTokenVersion, allTokenVersions, setTokenVersion }
}

