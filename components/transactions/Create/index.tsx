import React from 'react'
import { Creation } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box } from '@mui/system'
import css from './styles.module.css'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { dateString } from '@/utils/formatters'

type CreateTxInfoProps = {
  timestamp: number
  txInfo: Creation
}

const CreateTxInfo = ({
  timestamp,
  txInfo: { creator, factory, implementation, transactionHash },
}: CreateTxInfoProps) => (
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

export default CreateTxInfo
