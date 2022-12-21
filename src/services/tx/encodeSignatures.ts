import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { generatePreValidatedSignature } from '@safe-global/safe-core-sdk/dist/src/utils/signatures'

export const encodeSignatures = (safeTx: SafeTransaction, from?: string): string => {
  const owner = from?.toLowerCase()
  const needsOwnerSig = owner && !safeTx.signatures.has(owner)

  // https://docs.gnosis.io/safe/docs/contracts_signatures/#pre-validated-signatures
  if (needsOwnerSig) {
    const ownerSig = generatePreValidatedSignature(owner)
    safeTx.addSignature(ownerSig)
  }

  const encoded = safeTx.encodedSignatures()

  // Remove the "fake" signature we've just added
  if (needsOwnerSig) {
    safeTx.signatures.delete(owner)
  }

  return encoded
}
