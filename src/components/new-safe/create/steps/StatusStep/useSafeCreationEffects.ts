import type { Dispatch, SetStateAction } from 'react'
import { useEffect } from 'react'
import { pollSafeInfo } from '@/components/new-safe/create/logic'
import { SafeCreationStatus } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'
import { CREATE_SAFE_EVENTS, trackEvent } from '@/services/analytics'
import { updateAddressBook } from '@/components/new-safe/create/logic/address-book'
import { useAppDispatch } from '@/store'
import useChainId from '@/hooks/useChainId'
import { usePendingSafe } from './usePendingSafe'

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

  useEffect(() => {
    if (status === SafeCreationStatus.SUCCESS) {
      trackEvent(CREATE_SAFE_EVENTS.CREATED_SAFE)

      // Add the Safe and add names to the address book
      if (pendingSafe && pendingSafe.safeAddress) {
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

      // Asynchronously wait for Safe creation
      if (pendingSafe?.safeAddress) {
        pollSafeInfo(chainId, pendingSafe.safeAddress)
          .then(() => setStatus(SafeCreationStatus.INDEXED))
          .catch(() => setStatus(SafeCreationStatus.INDEX_FAILED))
      }
      return
    }

    if (status === SafeCreationStatus.WALLET_REJECTED) {
      trackEvent(CREATE_SAFE_EVENTS.REJECT_CREATE_SAFE)
    }

    if (
      status === SafeCreationStatus.WALLET_REJECTED ||
      status === SafeCreationStatus.ERROR ||
      status === SafeCreationStatus.REVERTED
    ) {
      if (pendingSafe?.txHash) {
        setPendingSafe(pendingSafe ? { ...pendingSafe, txHash: undefined, tx: undefined } : undefined)
      }
      return
    }
  }, [chainId, dispatch, pendingSafe, setPendingSafe, setStatus, status])
}

export default useSafeCreationEffects
