import React from 'react'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Box } from '@mui/system'
import css from './styles.module.css'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { dateString } from '@/utils/formatters'
import { isCreationTxInfo } from '@/utils/transaction-guards'

type SafeCreationTxProps = {
  txSummary: TransactionSummary
}

const SafeCreationTx = ({ txSummary }: SafeCreationTxProps) => {
  if (!isCreationTxInfo(txSummary.txInfo)) return null

  const timestamp = txSummary.timestamp
  const { creator, factory, implementation, transactionHash } = txSummary.txInfo

  return (
    <>
      <Box className={css.txCreation}>
        <InfoDetails title="Creator:">
          <EthHashInfo address={creator.value} shortAddress={false} showCopyButton hasExplorer />
        </InfoDetails>
        {factory && (
          <InfoDetails title="Factory:">
            <EthHashInfo address={factory?.value} shortAddress={false} showCopyButton hasExplorer />
          </InfoDetails>
        )}
        {implementation && (
          <InfoDetails title="Mastercopy:">
            <EthHashInfo address={implementation?.value} shortAddress={false} showCopyButton hasExplorer />
          </InfoDetails>
        )}
      </Box>
      <Box className={css.txSummary}>
        <TxDataRow title="Transaction hash:">{generateDataRowValue(transactionHash, 'hash', true)}</TxDataRow>
        <TxDataRow title="Created:">{timestamp ? dateString(timestamp) : null}</TxDataRow>
      </Box>
    </>
  )
}

export default SafeCreationTx
