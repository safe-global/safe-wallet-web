import { TypedDataEncoder } from 'ethers'
import { TxDataRow, generateDataRowValue } from '../TxDataRow'
import { type SafeTransactionData, type SafeVersion } from '@safe-global/safe-core-sdk-types'
import { getEip712TxTypes } from '@safe-global/protocol-kit/dist/src/utils'
import useSafeAddress from '@/hooks/useSafeAddress'
import useChainId from '@/hooks/useChainId'
import semverSatisfies from 'semver/functions/satisfies'

const NEW_DOMAIN_TYPE_HASH_VERSION = '>=1.3.0'

export function getDomainHash({
  chainId,
  safeAddress,
  safeVersion,
}: {
  chainId: string
  safeAddress: string
  safeVersion: SafeVersion
}): string {
  const includeChainId = semverSatisfies(safeVersion, NEW_DOMAIN_TYPE_HASH_VERSION)
  return TypedDataEncoder.hashDomain({
    ...(includeChainId && { chainId }),
    verifyingContract: safeAddress,
  })
}

const NEW_SAFE_TX_TYPE_HASH_VERSION = '>=1.0.0'

export function getMessageHash({
  safeVersion,
  safeTxData,
}: {
  safeVersion: SafeVersion
  safeTxData: SafeTransactionData
}): string {
  const usesBaseGas = semverSatisfies(safeVersion, NEW_SAFE_TX_TYPE_HASH_VERSION)
  const SafeTx = getEip712TxTypes(safeVersion).SafeTx

  // Clone to not modify the original
  const tx: any = { ...safeTxData }

  if (!usesBaseGas) {
    tx.dataGas = tx.baseGas
    delete tx.baseGas

    SafeTx[5].name = 'dataGas'
  }

  return TypedDataEncoder.hashStruct('SafeTx', { SafeTx }, tx)
}

export const SafeTxHashDataRow = ({
  safeTxHash,
  safeTxData,
  safeVersion,
}: {
  safeTxHash: string
  safeTxData?: SafeTransactionData
  safeVersion: SafeVersion
}) => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()

  const domainHash = getDomainHash({ chainId, safeAddress, safeVersion })
  const messageHash = safeTxData ? getMessageHash({ safeVersion, safeTxData }) : undefined

  return (
    <>
      <TxDataRow datatestid="tx-safe-hash" title="safeTxHash:">
        {generateDataRowValue(safeTxHash, 'hash')}
      </TxDataRow>
      <TxDataRow datatestid="tx-domain-hash" title="Domain hash:">
        {generateDataRowValue(domainHash, 'hash')}
      </TxDataRow>
      {messageHash && (
        <TxDataRow datatestid="tx-message-hash" title="Message hash:">
          {generateDataRowValue(messageHash, 'hash')}
        </TxDataRow>
      )}
    </>
  )
}
