import EthHashInfo from '@/components/common/EthHashInfo'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import { NOT_AVAILABLE } from '@/components/transactions/TxDetails'
import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { dateString } from '@/utils/formatters'
import { isCreationTxInfo } from '@/utils/transaction-guards'
import { Box } from '@mui/system'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'

type SafeCreationTxProps = {
  txSummary: TransactionSummary
}

const SafeCreationTx = ({ txSummary }: SafeCreationTxProps) => {
  if (!isCreationTxInfo(txSummary.txInfo)) return null

  const timestamp = txSummary.timestamp
  const { creator, factory, implementation, transactionHash } = txSummary.txInfo

  return (
    <>
      <Box data-sid="42769" className={css.txCreation}>
        <InfoDetails title="Creator:">
          <EthHashInfo address={creator.value} shortAddress={false} showCopyButton hasExplorer />
        </InfoDetails>
        <InfoDetails title="Factory:">
          {factory ? (
            <EthHashInfo name={factory.name} address={factory.value} shortAddress={false} showCopyButton hasExplorer />
          ) : (
            NOT_AVAILABLE
          )}
        </InfoDetails>
        <InfoDetails title="Mastercopy:">
          {implementation ? (
            <EthHashInfo
              name={implementation.name}
              address={implementation.value}
              shortAddress={false}
              showCopyButton
              hasExplorer
            />
          ) : (
            NOT_AVAILABLE
          )}
        </InfoDetails>
      </Box>
      <Box data-sid="17446" className={css.txSummary}>
        <TxDataRow title="Transaction hash:">{generateDataRowValue(transactionHash, 'hash', true)}</TxDataRow>
        <TxDataRow title="Created:">{timestamp ? dateString(timestamp) : null}</TxDataRow>
      </Box>
    </>
  )
}

export default SafeCreationTx
