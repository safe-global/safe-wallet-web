import { useEffect } from 'react'
import { closeNotification, showNotification } from '@/store/notificationsSlice'
import { ImplementationVersionState } from '@gnosis.pm/safe-react-gateway-sdk'
import useSafeInfo from './useSafeInfo'
import { useAppDispatch } from '@/store'
import { AppRoutes } from '@/config/routes'
import useAsync from './useAsync'
import { isValidMasterCopy } from '@/services/contracts/safeContracts'
import { useRouter } from 'next/router'
import { isValidSafeVersion } from './coreSDK/safeCoreSDK'

const OLD_URL = 'https://gnosis-safe.io/app'

const CLI_LINK = {
  href: 'https://github.com/5afe/safe-cli',
  title: 'Get CLI',
}

/**
 * General-purpose notifications relating to the entire Safe
 */
const useSafeNotifications = (): void => {
  const dispatch = useAppDispatch()
  const { query } = useRouter()
  const { safe } = useSafeInfo()
  const { chainId, version, implementationVersionState } = safe

  /**
   * Show a notification when the Safe version is out of date
   */

  useEffect(() => {
    if (implementationVersionState !== ImplementationVersionState.OUTDATED) {
      return
    }

    const isOldSafe = !isValidSafeVersion(version)

    const id = dispatch(
      showNotification({
        variant: 'warning',
        groupKey: 'safe-outdated-version',

        message: isOldSafe
          ? `Safe version ${version} is not supported by this web app anymore. You can update your Safe via the old web app here.`
          : `Your Safe version ${version} is out of date. Please update it.`,

        link: {
          href: isOldSafe
            ? `${OLD_URL}/${query.safe}/settings/details?no-redirect=true`
            : {
                pathname: AppRoutes.settings.setup,
                query: { safe: query.safe },
              },
          title: 'Update Safe',
        },
      }),
    )

    return () => {
      dispatch(closeNotification({ id }))
    }
  }, [dispatch, implementationVersionState, version, query.safe])

  /**
   * Show a notification when the Safe master copy is not supported
   */

  const masterCopy = safe.implementation.value

  const [validMasterCopy] = useAsync(() => {
    if (!masterCopy) return
    return isValidMasterCopy(chainId, masterCopy)
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
        link: CLI_LINK,
      }),
    )

    return () => {
      dispatch(closeNotification({ id }))
    }
  }, [dispatch, validMasterCopy])
}

export default useSafeNotifications
