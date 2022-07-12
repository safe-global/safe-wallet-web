import React from 'react'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
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
          <EthHashInfo address={creator.value} />
        </InfoDetails>
        {factory && (
          <InfoDetails title="Factory:">
            <EthHashInfo address={factory?.value} />
          </InfoDetails>
        )}
        {implementation && (
          <InfoDetails title="Implementation:">
            <EthHashInfo address={implementation?.value} />
          </InfoDetails>
        )}
      </Box>
      <Box className={css.txSummary}>
        <TxDataRow title="Transaction hash:">{generateDataRowValue(transactionHash, 'hash')}</TxDataRow>
        <TxDataRow title="Created:">{timestamp ? dateString(timestamp) : null}</TxDataRow>
      </Box>
    </>
  )
}

export default SafeCreationTx
