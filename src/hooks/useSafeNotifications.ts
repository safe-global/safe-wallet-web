import { useEffect } from 'react'
import { closeNotification, showNotification } from '@/store/notificationsSlice'
import { ImplementationVersionState } from '@gnosis.pm/safe-react-gateway-sdk'
import useSafeInfo from './useSafeInfo'
import { useAppDispatch } from '@/store'
import { AppRoutes } from '@/config/routes'
import { useCurrentChain } from './useChains'
import useAsync from './useAsync'
import { isOldestVersion, isValidMasterCopy } from '@/services/contracts/safeContracts'

const LEGACY_DESKTOP_APP = 'https://github.com/safe-global/safe-react/releases/tag/v3.22.1-desktop'
const CLI_LINK = 'https://github.com/5afe/safe-cli'

/**
 * General-purpose notifications relating to the entire Safe
 */
const useSafeNotifications = (): void => {
  const dispatch = useAppDispatch()
  const chain = useCurrentChain()
  const { safe, safeAddress } = useSafeInfo()
  const { chainId, version, implementationVersionState } = safe

  /**
   * Show a notification when the Safe version is out of date
   */

  useEffect(() => {
    if (implementationVersionState !== ImplementationVersionState.OUTDATED) {
      return
    }

    const isOldSafe = isOldestVersion(version)

    const link = isOldSafe
      ? {
          href: LEGACY_DESKTOP_APP,
          title: 'Desktop app',
        }
      : {
          href: {
            pathname: AppRoutes.settings.setup,
            query: { safe: `${chain?.shortName}:${safeAddress}` },
          },
          title: 'Update Safe',
        }

    const id = dispatch(
      showNotification({
        variant: 'warning',
        message: isOldSafe
          ? `Safe version ${version} is not supported by this web app anymore. Please use the legacy desktop app.`
          : `Your Safe version ${version} is out of date. Please update it.`,
        groupKey: 'safe-outdated-version',
        link,
      }),
    )

    return () => {
      dispatch(closeNotification({ id }))
    }
  }, [dispatch, chainId, safeAddress, implementationVersionState, version, chain?.shortName])

  /**
   * Show a notification when the Safe master copy is not supported
   */

  const masterCopy = safe.implementation.value

  const [validMasterCopy] = useAsync(async () => {
    if (masterCopy) {
      return await isValidMasterCopy(chainId, masterCopy)
    }
  }, [chainId, masterCopy])

  useEffect(() => {
    if (validMasterCopy === undefined || validMasterCopy) {
      return
    }

    const id = dispatch(
      showNotification({
        variant: 'warning',
        message: `This Safe was created with an unsupported base contract.
           The web interface might not work correctly.
           We recommend using the command line interface instead.`,
        groupKey: 'invalid-mastercopy',
        link: {
          href: CLI_LINK,
          title: 'Get CLI',
        },
      }),
    )

    return () => {
      dispatch(closeNotification({ id }))
    }
  }, [dispatch, validMasterCopy])
}

export default useSafeNotifications
