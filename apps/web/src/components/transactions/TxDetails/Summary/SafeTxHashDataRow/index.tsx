import { TxDataRow, generateDataRowValue } from '../TxDataRow'
import { type SafeTransactionData, type SafeVersion } from '@safe-global/safe-core-sdk-types'
import useSafeAddress from '@/hooks/useSafeAddress'
import useChainId from '@/hooks/useChainId'
import { getDomainHash, getSafeTxMessageHash } from '@/utils/safe-hashes'

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
  const messageHash = safeTxData ? getSafeTxMessageHash({ safeVersion, safeTxData }) : undefined

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
