import { PendingSafeData } from '@/components/create-safe'
import { Dispatch, SetStateAction, useEffect } from 'react'
import Safe from '@gnosis.pm/safe-core-sdk'
import { useRouter } from 'next/router'
import { pollSafeInfo } from '@/components/create-safe/status/usePendingSafeCreation'
import { AppRoutes } from '@/config/routes'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'

const useStatusListener = ({
  status,
  safeAddress,
  pendingSafe,
  setPendingSafe,
  setCreationPromise,
  setStatus,
}: {
  status: SafeCreationStatus
  safeAddress: string | undefined
  pendingSafe: PendingSafeData | undefined
  setPendingSafe: Dispatch<SetStateAction<PendingSafeData | undefined>>
  setCreationPromise: Dispatch<SetStateAction<Promise<Safe> | undefined>>
  setStatus: Dispatch<SetStateAction<SafeCreationStatus>>
}) => {
  const router = useRouter()

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
      safeAddress && router.push({ pathname: AppRoutes.safe.home, query: { safe: safeAddress } })
    }

    if (status === SafeCreationStatus.SUCCESS) {
      safeAddress && pendingSafe && checkCreatedSafe(pendingSafe.chainId, safeAddress)
      setPendingSafe(undefined)
    }

    if (status === SafeCreationStatus.ERROR || status === SafeCreationStatus.REVERTED) {
      setCreationPromise(undefined)
      if (pendingSafe?.txHash) {
        setPendingSafe((prev) => prev && { ...prev, txHash: undefined })
      }
    }
  }, [router, safeAddress, setPendingSafe, status, pendingSafe, setStatus, setCreationPromise])
}

export default useStatusListener
