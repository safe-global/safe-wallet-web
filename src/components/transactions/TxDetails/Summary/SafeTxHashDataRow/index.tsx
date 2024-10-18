import { sha256 } from 'ethers'
import { TxDataRow, generateDataRowValue } from '../TxDataRow'

export const SafeTxHashDataRow = ({ safeTxHash }: { safeTxHash: string }) => {
  const ledgerHash = sha256(safeTxHash)

  return (
    <>
      <TxDataRow datatestid="tx-safe-hash" title="safeTxHash:">
        {generateDataRowValue(safeTxHash, 'hash')}
      </TxDataRow>
      <TxDataRow datatestid="tx-safe-hash" title="Ledger hash:">
        {generateDataRowValue(ledgerHash, 'hash')}
      </TxDataRow>
    </>
  )
}
