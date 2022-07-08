import { type ReactElement } from 'react'
import {
  getTransactionDetails,
  Operation,
  TransactionDetails,
  TransactionSummary,
} from '@gnosis.pm/safe-react-gateway-sdk'
import { CircularProgress, Box, styled } from '@mui/material'

import TxSigners from '@/components/transactions/TxSigners'
import Summary from '@/components/transactions/TxDetails/Summary'
import TxData from '@/components/transactions/TxDetails/TxData'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import { isModuleExecutionInfo, isMultisendTxInfo, isMultisigExecutionInfo } from '@/utils/transaction-guards'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { DelegateCallWarning } from '@/components/transactions/Warning'
import EthHashInfo from '@/components/common/EthHashInfo'
import css from './styles.module.css'
import ErrorMessage from '@/components/tx/ErrorMessage'

export const NOT_AVAILABLE = 'n/a'

type TxDetailsProps = {
  txSummary: TransactionSummary
  txDetails: TransactionDetails
}

const PaperBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}))

const MultiSendTx = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
  const txInfo = isMultisendTxInfo(txDetails.txInfo) ? txDetails.txInfo : undefined

  return (
    <>
      {txDetails.txData?.operation === Operation.DELEGATE && (
        <PaperBox className={css.delegateCall}>
          <DelegateCallWarning showWarning={!txDetails.txData.trustedDelegateCallTarget} />
        </PaperBox>
      )}

      <PaperBox className={css.multisendInfo}>
        <InfoDetails title="MultiSend contract:">
          <EthHashInfo address={txInfo?.to.value || ''} />
        </InfoDetails>
        <TxDataRow title="Value:">{txInfo?.value}</TxDataRow>
      </PaperBox>

      <PaperBox className={`${css.txSummary} ${css.multisend}`}>
        <Summary txDetails={txDetails} />
      </PaperBox>

      <PaperBox className={`${css.txData} ${css.multisend} ${css.noPadding}`}>
        <TxData txDetails={txDetails} />
      </PaperBox>
    </>
  )
}

const TxDetailsBlock = ({ txSummary, txDetails }: TxDetailsProps): ReactElement => {
  // confirmations are in detailedExecutionInfo
  const hasSigners = isMultisigExecutionInfo(txSummary.executionInfo) && txSummary.executionInfo.confirmationsRequired

  return (
    <>
      {/* /Details */}
      <div className={[css.details, !hasSigners ? css.noSigners : ''].join(' ')}>
        {isMultisendTxInfo(txDetails.txInfo) ? (
          <MultiSendTx txDetails={txDetails} />
        ) : (
          <>
            <PaperBox className={css.txData}>
              <TxData txDetails={txDetails} />
            </PaperBox>

            {/* Module information*/}
            {isModuleExecutionInfo(txSummary.executionInfo) && (
              <PaperBox className={css.txModule}>
                <InfoDetails title="Module:">
                  <EthHashInfo address={txSummary.executionInfo.address.value} />
                </InfoDetails>
              </PaperBox>
            )}

            <PaperBox className={css.txSummary}>
              <Summary txDetails={txDetails} />
            </PaperBox>
          </>
        )}
      </div>

      {/* Signers */}
      {hasSigners && (
        <PaperBox className={css.txSigners}>
          <TxSigners txDetails={txDetails} txSummary={txSummary} />
        </PaperBox>
      )}
    </>
  )
}

const TxDetails = ({
  txSummary,
  txDetails,
}: {
  txSummary: TransactionSummary
  txDetails?: TransactionDetails // optional
}): ReactElement => {
  const chainId = useChainId()

  const [txDetailsData, error, loading] = useAsync<TransactionDetails>(async () => {
    return txDetails || getTransactionDetails(chainId, txSummary.id)
  }, [txDetails, chainId, txSummary.id])

  return (
    <Box className={css.container} sx={{ backgroundColor: 'border.light' }}>
      {txDetailsData ? (
        <TxDetailsBlock txSummary={txSummary} txDetails={txDetailsData} />
      ) : loading ? (
        <PaperBox className={css.loading}>
          <CircularProgress />
        </PaperBox>
      ) : (
        <PaperBox className={css.error}>
          <ErrorMessage error={error}>Couldn&apos;t load the transaction details</ErrorMessage>
        </PaperBox>
      )}
    </Box>
  )
}

export default TxDetails
