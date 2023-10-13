import { hashMessage, verifyMessage } from 'ethers/lib/utils'
import type { Web3Provider } from '@ethersproject/providers'

import { checksumAddress, sameAddress } from '@/utils/addresses'

// Server/client side
function getMessageHash({
  chainId,
  safeAddress,
  timestamp,
}: {
  chainId: string
  safeAddress: string
  timestamp: number
}): string {
  // TODO: Investigate security implications
  const message = chainId + checksumAddress(safeAddress) + timestamp

  return hashMessage(message)
}

// Server side
function isValidSignature({
  timestamp,
  chainId,
  safeAddress,
  signature,
  owners,
}: {
  timestamp: number
  chainId: string
  safeAddress: string
  signature: string
  owners: Array<string>
}): boolean {
  const isLtFiveMins = Date.now() - timestamp <= 5 * 60 * 1000

  if (!isLtFiveMins) {
    throw new Error('Timestamp is too old')
  }

  const hash = getMessageHash({ timestamp, chainId, safeAddress })

  // TODO: EIP-1271 verification
  const signerAddress = verifyMessage(hash, signature)

  return owners.some((owner) => {
    return sameAddress(owner, signerAddress)
  })
}

// Client side
function getSignature({
  provider,
  timestamp,
  chainId,
  safeAddress,
}: {
  provider: Web3Provider
  timestamp: number
  chainId: string
  safeAddress: string
}): Promise<string> {
  const signer = provider.getSigner()
  const hash = getMessageHash({ timestamp, chainId, safeAddress })

  // TODO: Adjust for Ledger
  return signer.signMessage(hash)
}

export async function isVerifiedOwner({
  owners,
  chainId,
  safeAddress,
  provider,
}: {
  owners: Array<string>
  chainId: string
  safeAddress: string
  provider: Web3Provider
}): Promise<boolean> {
  const timestamp = Date.now()

  let signature: string | null

  try {
    signature = await getSignature({
      provider,
      chainId,
      safeAddress,
      timestamp,
    })
  } catch {
    return false
  }

  return isValidSignature({
    owners,
    chainId,
    safeAddress,
    signature,
    timestamp,
  })
}
