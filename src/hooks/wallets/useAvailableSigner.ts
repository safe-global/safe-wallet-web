import { useMemo, useEffect } from 'react'
import { useWalletContext } from './useWallet'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { useNestedSafeOwners } from '../useNestedSafeOwners'
import { sameAddress } from '@/utils/addresses'

const useAvailableSigners = (tx: SafeTransaction | undefined, safe: SafeInfo) => {
  const { connectedWallet: wallet } = useWalletContext() ?? {}

  const nestedSafeOwners = useNestedSafeOwners()

  const isDirectOwner = useMemo(
    () => typeof wallet?.address === 'string' && safe.owners.map((owner) => owner.value).includes(wallet.address),
    [wallet?.address, safe],
  )

  return useMemo(() => {
    const result = nestedSafeOwners?.filter((owner) => !tx?.signatures.has(owner.toLowerCase())) ?? []
    if (wallet?.address && isDirectOwner && !tx?.signatures.has(wallet.address.toLowerCase())) {
      result?.push(wallet.address)
    }
    return result
  }, [isDirectOwner, nestedSafeOwners, tx?.signatures, wallet?.address])
}

export const useSelectAvailableSigner = (tx: SafeTransaction | undefined, safe: SafeInfo) => {
  const { signer, setSignerAddress } = useWalletContext() ?? {}
  const availableSigners = useAvailableSigners(tx, safe)

  // Sets the first available signer if non is set
  useEffect(() => {
    // Make sure the current signer can sign the tx
    if (availableSigners.some((available) => sameAddress(signer?.address, available))) {
      return
    }

    setSignerAddress?.(availableSigners[0])
  }, [availableSigners, safe, setSignerAddress, signer?.address, tx])
}

export default useAvailableSigners
