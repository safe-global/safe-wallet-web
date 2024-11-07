import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

export const getAvailableSigners = (
  wallet: ConnectedWallet | null | undefined,
  nestedSafeOwners: string[] | null,
  safe: SafeInfo,
  tx: SafeTransaction | undefined,
) => {
  if (!wallet || !nestedSafeOwners || !tx) {
    return []
  }

  const isDirectOwner =
    typeof wallet?.address === 'string' && safe.owners.map((owner) => owner.value).includes(wallet.address)
  const isFullySigned = tx.signatures.size >= safe.threshold
  const availableSigners = nestedSafeOwners ? [...nestedSafeOwners] : []
  if (wallet?.address && isDirectOwner && !tx?.signatures.has(wallet.address.toLowerCase())) {
    availableSigners?.push(wallet.address)
  }

  if (!isFullySigned) {
    // Filter signers that already signed
    return availableSigners.filter((signer) => !tx?.signatures.has(signer.toLowerCase()))
  }
  return availableSigners
}
