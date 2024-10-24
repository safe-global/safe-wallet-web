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

  const domainHash = TypedDataEncoder.hashDomain({
    chainId,
    verifyingContract: safeAddress,
  })
  const messageHash = safeTxData
    ? TypedDataEncoder.hashStruct('SafeTx', { SafeTx: getEip712TxTypes(safeVersion).SafeTx }, safeTxData)
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
