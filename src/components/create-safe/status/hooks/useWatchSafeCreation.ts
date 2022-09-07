import { PendingSafeData } from '@/components/create-safe'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useRouter } from 'next/router'
import { pollSafeInfo } from '@/components/create-safe/status/usePendingSafeCreation'
import { AppRoutes } from '@/config/routes'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import { trackEvent, CREATE_SAFE_EVENTS, SAFE_APPS_EVENTS } from '@/services/analytics'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'

const useWatchSafeCreation = ({
  status,
  safeAddress,
  pendingSafe,
  setPendingSafe,
  setStatus,
  chainId,
}: {
  status: SafeCreationStatus
  safeAddress: string | undefined
  pendingSafe: PendingSafeData | undefined
  setPendingSafe: Dispatch<SetStateAction<PendingSafeData | undefined>>
  setStatus: Dispatch<SetStateAction<SafeCreationStatus>>
  chainId: string
}) => {
  const router = useRouter()
  const chain = useAppSelector((state) => selectChainById(state, chainId))

  useEffect(() => {
    const checkCreatedSafe = async (chainId: string, address: string) => {
      try {
        await pollSafeInfo(chainId, address)
        setStatus(SafeCreationStatus.INDEXED)
      } catch (e) {
        setStatus(SafeCreationStatus.INDEX_FAILED)
      }
    }

    if (status === SafeCreationStatus.INDEXED) {
      trackEvent(CREATE_SAFE_EVENTS.GET_STARTED)
      const chainPrefix = chain?.shortName

      if (safeAddress && chainPrefix) {
        const address = `${chainPrefix}:${safeAddress}`
        const redirectUrl = router.query?.safeViewRedirectURL
        if (typeof redirectUrl === 'string') {
          // We're prepending the safe address directly here because the `router.push` doesn't parse
          // The URL for already existing query params
          const hasQueryParams = redirectUrl.includes('?')
          const appendChar = hasQueryParams ? '&' : '?'

          if (redirectUrl.includes('apps')) {
            trackEvent({ ...SAFE_APPS_EVENTS.SHARED_APP_OPEN_AFTER_SAFE_CREATION })
          }

          router.push(redirectUrl + `${appendChar}safe=${address}`)
        } else {
          router.push({ pathname: AppRoutes.safe.home, query: { safe: address } })
        }
      }
    }

    if (status === SafeCreationStatus.SUCCESS) {
      trackEvent(CREATE_SAFE_EVENTS.CREATED_SAFE)

      safeAddress && pendingSafe && checkCreatedSafe(chainId, safeAddress)
      setPendingSafe(undefined)
    }

    if (status === SafeCreationStatus.ERROR || status === SafeCreationStatus.REVERTED) {
      if (pendingSafe?.txHash) {
        setPendingSafe((prev) => (prev ? { ...prev, txHash: undefined } : undefined))
      }
    }
  }, [router, safeAddress, setPendingSafe, status, pendingSafe, setStatus, chainId, chain])
}

export default useWatchSafeCreation
