import { type ReactElement } from 'react'
import {
  getTransactionDetails,
  Operation,
  TransactionDetails,
  TransactionSummary,
} from '@gnosis.pm/safe-react-gateway-sdk'
import { CircularProgress, Box as MuiBox, styled } from '@mui/material'

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
import TxShareLink from '../TxShareLink'

export const NOT_AVAILABLE = 'n/a'

type TxDetailsProps = {
  txSummary: TransactionSummary
  txDetails: TransactionDetails
}

const Box = styled(MuiBox)(({ theme }) => ({
  border: `1px solid ${theme.palette.border.light}`,
}))

const MultiSendTx = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
  const txInfo = isMultisendTxInfo(txDetails.txInfo) ? txDetails.txInfo : undefined

  return (
    <>
      {txDetails.txData?.operation === Operation.DELEGATE && (
        <div className={css.delegateCall}>
          <DelegateCallWarning showWarning={!txDetails.txData.trustedDelegateCallTarget} />
        </div>
      )}

      <div className={css.multisendInfo}>
        <InfoDetails title="MultiSend contract:">
          <EthHashInfo address={txInfo?.to.value || ''} />
        </InfoDetails>
        <TxDataRow title="Value:">{txInfo?.value}</TxDataRow>
      </div>

      <Box className={`${css.txSummary} ${css.multisend}`} sx={{ borderTop: 'none' }}>
        <Summary txDetails={txDetails} />
      </Box>

      <Box className={`${css.txData} ${css.multisend} ${css.noPadding}`}>
        <TxData txDetails={txDetails} />
      </Box>
    </>
  )
}

const TxDetailsBlock = ({ txSummary, txDetails }: TxDetailsProps): ReactElement => {
  // confirmations are in detailedExecutionInfo
  const hasSigners = isMultisigExecutionInfo(txSummary.executionInfo) && txSummary.executionInfo.confirmationsRequired

  return (
    <>
      {/* /Details */}
      <div className={`${css.details} ${!hasSigners ? css.noSigners : ''}`}>
        <div className={css.shareLink}>
          <TxShareLink id={txSummary.id} />
        </div>

        {isMultisendTxInfo(txDetails.txInfo) ? (
          <MultiSendTx txDetails={txDetails} />
        ) : (
          <>
            <Box className={css.txData}>
              <TxData txDetails={txDetails} />
            </Box>

            {/* Module information*/}
            {isModuleExecutionInfo(txSummary.executionInfo) && (
              <Box className={css.txModule}>
                <InfoDetails title="Module:">
                  <EthHashInfo address={txSummary.executionInfo.address.value} />
                </InfoDetails>
              </Box>
            )}

            <Box className={css.txSummary}>
              <Summary txDetails={txDetails} />
            </Box>
          </>
        )}
      </div>

      {/* Signers */}
      {hasSigners && (
        <Box className={css.txSigners}>
          <TxSigners txDetails={txDetails} txSummary={txSummary} />
        </Box>
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
    <Box className={css.container}>
      {txDetailsData ? (
        <TxDetailsBlock txSummary={txSummary} txDetails={txDetailsData} />
      ) : loading ? (
        <div className={css.loading}>
          <CircularProgress />
        </div>
      ) : (
        <div className={css.error}>
          <ErrorMessage error={error}>Couldn&apos;t load the transaction details</ErrorMessage>
        </div>
      )}
    </Box>
  )
}

export default TxDetails
