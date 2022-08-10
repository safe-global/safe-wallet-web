import Safe from '@gnosis.pm/safe-core-sdk'
import { PendingSafeData } from '@/components/create-safe'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useWeb3 } from '@/hooks/wallets/web3'
import { createNewSafe } from '@/components/create-safe/sender'
import { getSafeDeployProps, SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'

const useCreatePromise = ({
  status,
  creationPromise,
  pendingSafe,
  safeCreationCallback,
  setCreationPromise,
  setStatus,
}: {
  status: SafeCreationStatus
  creationPromise: Promise<Safe> | undefined
  pendingSafe: PendingSafeData | undefined
  safeCreationCallback: (txHash: string) => void
  setCreationPromise: Dispatch<SetStateAction<Promise<Safe> | undefined>>
  setStatus: Dispatch<SetStateAction<SafeCreationStatus>>
}) => {
  const ethersProvider = useWeb3()

  useEffect(() => {
    if (
      creationPromise ||
      pendingSafe?.txHash ||
      !ethersProvider ||
      !pendingSafe ||
      status === SafeCreationStatus.ERROR ||
      status === SafeCreationStatus.AWAITING_WALLET
    ) {
      return
    }

    setStatus(SafeCreationStatus.AWAITING)
    setCreationPromise(createNewSafe(ethersProvider, getSafeDeployProps(pendingSafe, safeCreationCallback)))
  }, [safeCreationCallback, creationPromise, ethersProvider, pendingSafe, setStatus, setCreationPromise, status])
}

export default useCreatePromise
