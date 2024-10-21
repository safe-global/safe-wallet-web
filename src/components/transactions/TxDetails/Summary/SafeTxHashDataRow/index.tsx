import { TypedDataEncoder } from 'ethers'
import { TxDataRow, generateDataRowValue } from '../TxDataRow'
import { type SafeTransactionData, type SafeVersion } from '@safe-global/safe-core-sdk-types'
import { getEip712TxTypes } from '@safe-global/protocol-kit/dist/src/utils'
import useSafeAddress from '@/hooks/useSafeAddress'
import useChainId from '@/hooks/useChainId'

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
  const domainHash = `0x${TypedDataEncoder.hashDomain({
    chainId,
    verifyingContract: safeAddress,
  })
    .slice(2)
    .toUpperCase()}`
  const messageHash = safeTxData
    ? `0x${TypedDataEncoder.hashStruct('SafeTx', { SafeTx: getEip712TxTypes(safeVersion).SafeTx }, safeTxData)
        .slice(2)
        .toUpperCase()}`
    : undefined

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
