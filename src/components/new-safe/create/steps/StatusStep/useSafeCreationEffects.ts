import type { Dispatch, SetStateAction } from 'react'
import { useEffect } from 'react'
import { pollSafeInfo } from '@/components/new-safe/create/logic'
import { SafeCreationStatus } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'
import { CREATE_SAFE_EVENTS, trackEvent } from '@/services/analytics'
import { updateAddressBook } from '@/components/new-safe/create/logic/address-book'
import { useAppDispatch } from '@/store'
import useChainId from '@/hooks/useChainId'
import { usePendingSafe } from './usePendingSafe'
import { gtmSetSafeAddress } from '@/services/analytics/gtm'

const useSafeCreationEffects = ({
  status,
  setStatus,
}: {
  status: SafeCreationStatus
  setStatus: Dispatch<SetStateAction<SafeCreationStatus>>
}) => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const [pendingSafe, setPendingSafe] = usePendingSafe()

  // Asynchronously wait for Safe creation
  useEffect(() => {
    if (status === SafeCreationStatus.SUCCESS && pendingSafe?.safeAddress) {
      pollSafeInfo(chainId, pendingSafe.safeAddress)
        .then(() => setStatus(SafeCreationStatus.INDEXED))
        .catch(() => setStatus(SafeCreationStatus.INDEX_FAILED))
    }
  }, [chainId, pendingSafe?.safeAddress, status, setStatus])

  // Warn about leaving the page before Safe creation
  useEffect(() => {
    if (status !== SafeCreationStatus.PROCESSING && status !== SafeCreationStatus.AWAITING) return

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = 'Are you sure you want to leave before your Safe Account is fully created?'
      return event.returnValue
    }

    window.addEventListener('beforeunload', onBeforeUnload)

    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [status])

  // Add Safe to Added Safes and add owner and safe names to Address Book
  useEffect(() => {
    if (status === SafeCreationStatus.SUCCESS && pendingSafe?.safeAddress) {
      dispatch(
        updateAddressBook(
          chainId,
          pendingSafe.safeAddress,
          pendingSafe.name,
          pendingSafe.owners,
          pendingSafe.threshold,
        ),
      )
    }
  }, [status, chainId, dispatch, pendingSafe])

  // Reset pending Safe on error
  useEffect(() => {
    if (
      status === SafeCreationStatus.WALLET_REJECTED ||
      status === SafeCreationStatus.ERROR ||
      status === SafeCreationStatus.REVERTED
    ) {
      if (pendingSafe?.txHash) {
        setPendingSafe(pendingSafe ? { ...pendingSafe, txHash: undefined, tx: undefined } : undefined)
      }
    }
  }, [pendingSafe, setPendingSafe, status])

  // Tracking
  useEffect(() => {
    if (status === SafeCreationStatus.SUCCESS) {
      pendingSafe?.safeAddress && gtmSetSafeAddress(pendingSafe.safeAddress)
      trackEvent({ ...CREATE_SAFE_EVENTS.CREATED_SAFE, label: 'deployment' })
      return
    }

    if (status === SafeCreationStatus.WALLET_REJECTED) {
      trackEvent(CREATE_SAFE_EVENTS.REJECT_CREATE_SAFE)
      return
    }
  }, [pendingSafe?.safeAddress, status])
}

export default useSafeCreationEffects
