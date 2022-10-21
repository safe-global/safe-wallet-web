import type { Dispatch, SetStateAction } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { type UrlObject } from 'url'
import { pollSafeInfo } from '@/components/create-safe/logic'
import { AppRoutes } from '@/config/routes'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import { CREATE_SAFE_EVENTS, SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import chains from '@/config/chains'
import { updateAddressBook } from '../logic/address-book'
import { useAppDispatch } from '@/store'
import type { PendingSafeData } from '@/components/create-safe'

const getRedirect = (chainId: string, safeAddress: string, redirectQuery?: string | string[]): UrlObject | string => {
  const redirectUrl = Array.isArray(redirectQuery) ? redirectQuery[0] : redirectQuery
  const chainPrefix = Object.keys(chains).find((prefix) => chains[prefix] === chainId)
  const address = `${chainPrefix}:${safeAddress}`

  // Should never happen in practice
  if (!chainPrefix) return AppRoutes.index

  // Go to the dashboard if no specific redirect is provided
  if (!redirectUrl) {
    return { pathname: AppRoutes.home, query: { safe: address } }
  }

  // Otherwise, redirect to the provided URL (e.g. from a Safe App)

  // Track the redirect to Safe App
  if (redirectUrl.includes('apps')) {
    trackEvent(SAFE_APPS_EVENTS.SHARED_APP_OPEN_AFTER_SAFE_CREATION)
  }

  // We're prepending the safe address directly here because the `router.push` doesn't parse
  // The URL for already existing query params
  const hasQueryParams = redirectUrl.includes('?')
  const appendChar = hasQueryParams ? '&' : '?'
  return redirectUrl + `${appendChar}safe=${address}`
}

const useSafeCreationEffects = ({
  pendingSafe,
  setPendingSafe,
  status,
  safeAddress,
  setStatus,
  chainId,
}: {
  pendingSafe: PendingSafeData | undefined
  setPendingSafe: Dispatch<SetStateAction<PendingSafeData | undefined>>
  status: SafeCreationStatus
  safeAddress: string | undefined
  setStatus: Dispatch<SetStateAction<SafeCreationStatus>>
  chainId: string
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (status === SafeCreationStatus.INDEXED) {
      trackEvent(CREATE_SAFE_EVENTS.GET_STARTED)

      if (safeAddress) {
        router.push(getRedirect(chainId, safeAddress, router.query?.safeViewRedirectURL))
      }
    }

    if (status === SafeCreationStatus.SUCCESS) {
      trackEvent(CREATE_SAFE_EVENTS.CREATED_SAFE)

      // Add the Safe and add names to the address book
      if (pendingSafe) {
        dispatch(
          updateAddressBook(chainId, pendingSafe.address, pendingSafe.name, pendingSafe.owners, pendingSafe.threshold),
        )
      }

      setPendingSafe(undefined)

      // Asynchronously wait for Safe creation
      if (safeAddress) {
        pollSafeInfo(chainId, safeAddress)
          .then(() => setStatus(SafeCreationStatus.INDEXED))
          .catch(() => setStatus(SafeCreationStatus.INDEX_FAILED))
      }
    }

    if (
      status === SafeCreationStatus.ERROR ||
      status === SafeCreationStatus.REVERTED ||
      status === SafeCreationStatus.TIMEOUT
    ) {
      if (pendingSafe?.txHash) {
        setPendingSafe((prev) => (prev ? { ...prev, txHash: undefined, tx: undefined } : undefined))
      }
    }

    if (status === SafeCreationStatus.WALLET_REJECTED) {
      trackEvent(CREATE_SAFE_EVENTS.REJECT_CREATE_SAFE)
    }
  }, [router, dispatch, safeAddress, setPendingSafe, status, pendingSafe, setStatus, chainId])
}

export default useSafeCreationEffects
